import { Dimensions } from 'react-native'

export function	msToTime(duration, includeFractions, includeHours) {
  var negative = false
  if(duration<0) {
  	negative = true
  	duration = -duration
  }
  var milliseconds = parseInt((duration%1000)/100)
      , seconds = parseInt((duration/1000)%60)
      , minutes = parseInt((duration/(1000*60))%60)
      , hours = parseInt((duration/(1000*60*60))%24);
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds
  var output
  output = negative ? "-" : ""
  output += includeHours ? hours + ":" : ""
  output += minutes + ":" + seconds
  output += includeFractions ? "." + milliseconds : "" 
  return output
}

export function tick(endOfRoundFunction, noticeSeconds, noticeFunction) {

	if (this.props.getTournamentQuery.loading || this.props.getTournamentQuery.error || this.props.getServerTimeMutation.loading || this.props.getServerTimeMutation.error) {return}
	const msPerMinute = 60 * 1000
	const noticeMilliseconds = noticeSeconds * 1000
	const tourney = this.props.getTournamentQuery.Tournament
	const segments = sortSegments(tourney.segments) //.sort( (a,b) => {
	const timer = tourney.timer
	const time = new Date()
	const totalElapsedMS = Math.max(0,timer.active ? timer.elapsed + time.valueOf() - this.state.offsetFromServerTime - new Date(timer.updatedAt).valueOf() : timer.elapsed)
	var cumulativeMS = 0
	var currentSegmentIndex = null
	for (var i = 0, len = segments.length; i < len; i++) {
	  if (totalElapsedMS >= cumulativeMS && totalElapsedMS < (cumulativeMS + segments[i].duration * msPerMinute)) {
	    currentSegmentIndex = i
	    break
	  }
	  cumulativeMS += segments[i].duration * msPerMinute
	}

	if(currentSegmentIndex==null) {
	  this.setState ({
	    time: time,
	    ms: 0,
	    display: {timer: "00:00", currentBlinds: "0,000/0,000",},
	    segment: segments[segments.length-1],
	    nextSegment: null,
	    csi: segments.length-1,
	    currentDuration: segments[segments.length-1].duration,
	    totalDuration: cumulativeMS,
	    percentage: 0,
	    noticeStatus: false,
	    timerActive: false,
	  })
	  return
	}
	const duration = cumulativeMS + segments[currentSegmentIndex].duration * msPerMinute
	const ms = duration - totalElapsedMS
	if (ms < noticeMilliseconds && this.state.ms >= noticeMilliseconds && this.state.timerActive) {noticeFunction()}
	if (currentSegmentIndex > this.state.csi && currentSegmentIndex > 0 && this.state.csi != null && this.state.timerActive) {endOfRoundFunction()}
	this.setState ({
	  time: time,
	  ms: ms,
	  display: {
	  	timer: timer.active ? msToTime(ms + 1000) : msToTime(ms),
	  	currentBlinds: segments[currentSegmentIndex].sBlind.toLocaleString() + '/' + segments[currentSegmentIndex].bBlind.toLocaleString(),
	  },
	  segment: segments[currentSegmentIndex],
	  nextSegment: currentSegmentIndex < segments.length -1 ? segments[currentSegmentIndex + 1] : null,
	  csi: currentSegmentIndex,
	  currentDuration: segments[currentSegmentIndex].duration, 
	  totalDuration: duration,
	  percentage: ms/(segments[currentSegmentIndex].duration * msPerMinute),
	  noticeStatus: ms < noticeMilliseconds,
	  timerActive: timer.active,
	})
}

export function sortSegments (segments) {
	return segments.sort((a,b) => {
		return (a.sBlind + a.bBlind + a.ante - b.sBlind - b.bBlind - b.ante)
	})
}

export function sortChips (chips) {
	return chips.sort((a,b) => {
		return (a.denom - b.denom)
	})
}


const {height, width} = Dimensions.get('window');

export const responsiveHeight = (h) => {
  return height*(h/100);
};

export const responsiveWidth = (w) => {
  return width*(w/100);
};

export const responsiveFontSize = (f) => {
  return Math.sqrt((height*height)+(width*width))*(f/100);
};
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

	if (this.props.getTournament.loading || this.props.getTournament.error) {return}
	const msPerMinute = 60 * 1000
	const noticeMilliseconds = noticeSeconds * 1000
	const tourney = this.props.getTournament.Tournament
	const segments = tourney.segments
	const timer = tourney.timer
	const time = new Date()
	const totalElapsedMS = timer.active ? timer.elapsed + time.valueOf() - new Date(timer.updatedAt).valueOf() : timer.elapsed
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
	    display: "00:00",
	    segment: segments[segments.length-1],
	    nextSegment: null,
	    csi: segments.length-1,
	    currentDuration: segments[segments.length-1].duration,
	    totalDuration: cumulativeMS,
	    percentage: 0,
	    noticeStatus: false,
	  })
	  return
	}
	const duration = cumulativeMS + segments[currentSegmentIndex].duration * msPerMinute
	const ms = duration - totalElapsedMS
	if (ms < noticeMilliseconds && this.state.ms >= noticeMilliseconds) {noticeFunction()}
	if (currentSegmentIndex > this.state.csi && currentSegmentIndex > 0 && this.state.csi != null) {endOfRoundFunction()}
	this.setState ({
	  time: time,
	  ms: ms,
	  display: timer.active ? msToTime(ms + 1000) : msToTime(ms),
	  segment: segments[currentSegmentIndex],
	  nextSegment: currentSegmentIndex < segments.length -1 ? segments[currentSegmentIndex + 1] : null,
	  csi: currentSegmentIndex,
	  currentDuration: segments[currentSegmentIndex].duration, 
	  totalDuration: duration,
	  percentage: ms/(segments[currentSegmentIndex].duration * msPerMinute),
	  noticeStatus: ms < noticeMilliseconds,
	})
}
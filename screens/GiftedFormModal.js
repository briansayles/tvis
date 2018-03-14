import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { FontAwesome } from '@expo/vector-icons';

class GiftedFormModal extends React.Component {

  static navigationOptions({ navigation }) {
    const { getTitle, onClose, modalTitle } = navigation.state.params || {};
    return {
      headerTitle: modalTitle,
      headerStyle: { backgroundColor: '#F37600' },
      headerTitleStyle: { color: 'white' },
    };
  }

  render() {
    const { renderContent } = this.props.navigation.state.params || {};
    return (
      <View style={{ width: '100%', height: '100%' }}>
        {renderContent()}
      </View>
    );
  }
}

GiftedFormModal.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.object
    })
  })
};

GiftedFormModal.defaultProps = {
  navigation: null
};

export default GiftedFormModal;
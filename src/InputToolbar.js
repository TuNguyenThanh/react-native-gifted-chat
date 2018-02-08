import PropTypes from 'prop-types';
import React from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  ViewPropTypes,
  Dimensions
} from 'react-native';

import Composer from './Composer';
import Send from './Send';
import Actions from './Actions';

export default class InputToolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      position: 'absolute'
    };
  }

  componentWillMount () {
    this.keyboardWillShowListener =
      Keyboard.addListener('keyboardWillShow', this._keyboardWillShow);
    this.keyboardWillHideListener =
      Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
  }

  componentWillUnmount () {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }

  _keyboardWillShow = () => {
    this.setState({
      position: 'relative'
    });
  }

  _keyboardWillHide = () => {
    this.setState({
      position: 'absolute'
    });
  }

  renderActions() {
    if (this.props.renderActions) {
      return this.props.renderActions(this.props);
    } else if (this.props.onPressActionButton) {
      return <Actions {...this.props} />;
    }
    return null;
  }

  renderSend() {
    if (this.props.renderSend) {
      return this.props.renderSend(this.props);
    }
    return <Send {...this.props}/>;
  }

  renderComposer() {
    if (this.props.renderComposer) {
      return this.props.renderComposer(this.props);
    }

    return (
      <Composer
        {...this.props}
      />
    );
  }

  renderAccessory() {
    if (this.props.renderAccessory) {
      return (
        <View style={[styles.accessory, this.props.accessoryStyle]}>
          {this.props.renderAccessory(this.props)}
        </View>
      );
    }
    return null;
  }

  render() {
    console.log('onInputSizeChanged', this.props)
    const {composerHeight} = this.props
    return (
      <View
        style={[styles.container, this.props.containerStyle, { position: this.state.position, height: composerHeight + 20}]}>
        <View style={[styles.primary, this.props.primaryStyle]}>
          <View style={{flex: 1}}>
            {this.renderActions()}
          </View>
          <View style={{flex: 5}}>
            {this.renderComposer()}
          </View>
          <View style={{flex: 1}}>
            {this.renderSend()}
          </View>
        </View>
        {this.renderAccessory()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#b2b2b2',
    backgroundColor: '#FFFFFF',
    bottom: 0,
    width: Dimensions.get('window').width,
    marginBottom: 10,
  },
  primary: {
    flexDirection: 'row',
    flex: 1,
  },
  accessory: {
    height: 44,
  },
});

InputToolbar.defaultProps = {
  renderAccessory: null,
  renderActions: null,
  renderSend: null,
  renderComposer: null,
  containerStyle: {},
  primaryStyle: {},
  accessoryStyle: {},
};

InputToolbar.propTypes = {
  renderAccessory: PropTypes.func,
  renderActions: PropTypes.func,
  renderSend: PropTypes.func,
  renderComposer: PropTypes.func,
  onPressActionButton: PropTypes.func,
  containerStyle: ViewPropTypes.style,
  primaryStyle: ViewPropTypes.style,
  accessoryStyle: ViewPropTypes.style,
};

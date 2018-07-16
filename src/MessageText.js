import PropTypes from 'prop-types';
import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  View,
  ViewPropTypes,
  Image,
  TouchableOpacity
} from 'react-native';

import ParsedText from 'react-native-parsed-text';
import Communications from 'react-native-communications';
import LinkPreview from 'react-native-link-preview'

const WWW_URL_PATTERN = /^www\./i;

export default class MessageText extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      linkPreview: null
    }

    this.onUrlPress = this.onUrlPress.bind(this);
    this.onPhonePress = this.onPhonePress.bind(this);
    this.onEmailPress = this.onEmailPress.bind(this);
    this.onHashTagPress = this.onHashTagPress.bind(this);
  }

  async componentWillMount () {
    await LinkPreview.getPreview(this.props.currentMessage.text.replace(/\n/g, ' ')).then(data => {
      console.log(data)
      this.setState({
        linkPreview: data
      })
    }).catch(error => {
      // console.log(error)
    })
  }

  onHashTagPress (hashTag) {
    const onPress = this.props.onPressHashTag
    typeof onPress === 'function' && onPress(hashTag)
  }

  onUrlPress(url) {
    // When someone sends a message that includes a website address beginning with "www." (omitting the scheme),
    // react-native-parsed-text recognizes it as a valid url, but Linking fails to open due to the missing scheme.
    if (WWW_URL_PATTERN.test(url)) {
      this.onUrlPress(`http://${url}`);
    } else {
      const onPress = this.props.onPressLinkPreview
      typeof onPress === 'function' && onPress(this.state.linkPreview)
      // Linking.canOpenURL(url).then((supported) => {
      //   if (!supported) {
      //     console.error('No handler for URL:', url);
      //   } else {
      //     Linking.openURL(url);
      //   }
      // });
    }
  }

  onPhonePress(phone) {
    const options = [
      'Call',
      'Text',
      'Cancel',
    ];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions({
      options,
      cancelButtonIndex,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          Communications.phonecall(phone, true);
          break;
        case 1:
          Communications.text(phone);
          break;
      }
    });
  }

  onEmailPress(email) {
    Communications.email([email], null, null, null, null);
  }

  render() {
    const linkStyle = StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]])
    const { hashTagStyle, currentMessage, onPressMessageOrder } = this.props
    const { linkPreview } = this.state
    const isReferenceOrder = !!currentMessage.reference

    if (isReferenceOrder) {
      return (
        <TouchableOpacity
          style={[styles[this.props.position].container, this.props.containerStyle[this.props.position], { flexDirection: 'row' }]}
          onPress={() => {
            const onPress = this.props.onPressMessageOrder
            typeof onPress === 'function' && onPress(currentMessage.reference)
          }}
        >
          <Text style={[styles[this.props.position].text, this.props.textStyle[this.props.position], this.props.customTextStyle]}>
            {this.props.currentMessage.text}
          </Text>
          {this.props.renderIconRight}
        </TouchableOpacity>
      )
    }

    return (
      <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
        {
          this.props.currentMessage.post && this.props.currentMessage.post.hashTags && this.props.renderTag &&
          this.props.renderTag
        }
        <ParsedText
          style={[styles[this.props.position].text, this.props.textStyle[this.props.position], this.props.customTextStyle]}
          parse={[
            {type: 'url', style: linkStyle, onPress: this.onUrlPress},
            {type: 'phone', style: linkStyle, onPress: this.onPhonePress},
            {type: 'email', style: linkStyle, onPress: this.onEmailPress},
            {pattern: /#(\w+)/, style: hashTagStyle, onPress: this.onHashTagPress}
          ]}
          childrenProps={{...this.props.textProps}}
        >
          {this.props.currentMessage.text}
        </ParsedText>
        {
          linkPreview &&
          <TouchableOpacity
            style={styles.wrapLinkPreviewStyle}
            onPress={() => {
              const onPress = this.props.onPressLinkPreview
              typeof onPress === 'function' && onPress(linkPreview)
            }}
          >
            <Image
              style={{ width: null, height: 100 }}
              source={{uri: linkPreview.images[0]}}
            />
            <View style={styles.wrapTitleViewStyle}>
              <Text style={this.props.titleLinkPreViewStyle} numberOfLines={1}>{linkPreview.title}</Text>
              <Text style={this.props.urlLinkPreviewStyle} numberOfLines={1}>{linkPreview.url}</Text>
            </View>
          </TouchableOpacity>
        }
      </View>
    );
  }
}

const textStyle = {
  fontSize: 16,
  lineHeight: 20,
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 10,
  marginRight: 10,
};

const borderRadiusStyle = 16
const styles = {
  wrapLinkPreviewStyle: {
    margin: -10,
    marginTop: 0,
    borderBottomLeftRadius: borderRadiusStyle,
    borderBottomRightRadius: borderRadiusStyle
  },
  wrapTitleViewStyle: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomLeftRadius: borderRadiusStyle,
    borderBottomRightRadius: borderRadiusStyle
  },
  left: StyleSheet.create({
    container: {
    },
    text: {
      color: 'black',
      ...textStyle,
    },
    link: {
      color: 'black',
      textDecorationLine: 'underline',
    },
  }),
  right: StyleSheet.create({
    container: {
    },
    text: {
      color: 'white',
      ...textStyle,
    },
    link: {
      color: 'white',
      textDecorationLine: 'underline',
    },
  }),
};

MessageText.contextTypes = {
  actionSheet: PropTypes.func,
};

MessageText.defaultProps = {
  position: 'left',
  currentMessage: {
    text: '',
  },
  containerStyle: {},
  textStyle: {},
  linkStyle: {},
  parsePatterns: () => [],
};

MessageText.propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  textStyle: PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
  linkStyle: PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
  parsePatterns: PropTypes.func,
  textProps: PropTypes.object,
  customTextStyle: Text.propTypes.style,
};

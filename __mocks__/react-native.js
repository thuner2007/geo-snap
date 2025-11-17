/**
 * React Native Mock for Jest Testing
 *
 * Provides minimal mocks for React Native components and APIs
 * to enable testing without native dependencies
 */

const React = require('react');

// Mock View component
function View(props) {
  return React.createElement('View', props, props.children);
}

// Mock Text component
function Text(props) {
  return React.createElement('Text', props, props.children);
}

// Mock StyleSheet
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
  compose: (style1, style2) => [style1, style2],
  absoluteFill: {},
  hairlineWidth: 1,
};

// Mock Platform
const Platform = {
  OS: 'ios',
  Version: 14,
  select: (obj) => obj.ios || obj.default,
  isTV: false,
  isTesting: true,
};

// Mock Dimensions
const Dimensions = {
  get: () => ({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock other commonly used components
function TouchableOpacity(props) {
  return React.createElement('TouchableOpacity', props, props.children);
}

function TouchableHighlight(props) {
  return React.createElement('TouchableHighlight', props, props.children);
}

function ScrollView(props) {
  return React.createElement('ScrollView', props, props.children);
}

function Image(props) {
  return React.createElement('Image', props);
}

function TextInput(props) {
  return React.createElement('TextInput', props);
}

function FlatList(props) {
  return React.createElement('FlatList', props);
}

function SafeAreaView(props) {
  return React.createElement('SafeAreaView', props, props.children);
}

function ActivityIndicator(props) {
  return React.createElement('ActivityIndicator', props);
}

function Modal(props) {
  return React.createElement('Modal', props, props.children);
}

function Pressable(props) {
  return React.createElement('Pressable', props, props.children);
}

module.exports = {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Pressable,

  // Mock findNodeHandle
  findNodeHandle: () => 1,

  // Mock other utilities
  PixelRatio: {
    get: () => 2,
    getFontScale: () => 1,
    getPixelSizeForLayoutSize: (size) => size * 2,
    roundToNearestPixel: (size) => Math.round(size),
  },

  Animated: {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),
    View,
    Text,
    Image,
    ScrollView,
    timing: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback()),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback()),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    sequence: jest.fn((animations) => ({
      start: jest.fn((callback) => callback && callback()),
      stop: jest.fn(),
    })),
    parallel: jest.fn((animations) => ({
      start: jest.fn((callback) => callback && callback()),
      stop: jest.fn(),
    })),
    decay: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback()),
      stop: jest.fn(),
    })),
    loop: jest.fn((animation) => ({
      start: jest.fn(),
      stop: jest.fn(),
    })),
    event: jest.fn(() => jest.fn()),
    createAnimatedComponent: (Component) => Component,
  },

  AppRegistry: {
    registerComponent: jest.fn(),
    getAppKeys: jest.fn(() => []),
    runApplication: jest.fn(),
  },

  NativeModules: {},
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),

  // Alert
  Alert: {
    alert: jest.fn(),
  },

  // Keyboard
  Keyboard: {
    dismiss: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
  },
};

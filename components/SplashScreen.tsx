import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');
const logo = require('@/assets/images/icon.png');

interface Props {
  onFinish: () => void;
}

export default function AnimatedSplashScreen({ onFinish }: Props) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const barsAnim = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(barsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.delay(1500),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
          ELECTRO BAZAR
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Shop the Future of Electronics
        </Animated.Text>

        <View style={styles.barsContainer}>
          {[0, 1, 2, 3, 4].map(i => (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                {
                  opacity: barsAnim.interpolate({
                    inputRange: [i * 0.2, i * 0.2 + 0.2],
                    outputRange: [0.2, 1],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      scaleY: barsAnim.interpolate({
                        inputRange: [i * 0.2, i * 0.2 + 0.2],
                        outputRange: [0.5, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        <Animated.Text style={[styles.version, { opacity: taglineOpacity }]}>
          v1.0.0
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width,
    height,
    backgroundColor: '#1a3ec8',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffc107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#ffc107',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 32,
    alignItems: 'flex-end',
    height: 40,
  },
  bar: {
    width: 6,
    height: 30,
    backgroundColor: '#ffc107',
    borderRadius: 3,
  },
  version: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
});

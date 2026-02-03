/**
 * Nyarm - 猫キャラクターコンポーネント
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';

interface Props {
    message: string;
}

export const CatCharacter: React.FC<Props> = ({ message }) => {
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const tailAnim = useRef(new Animated.Value(0)).current;
    const eyeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // 体のバウンスアニメーション
        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: -5,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // しっぽのアニメーション
        Animated.loop(
            Animated.sequence([
                Animated.timing(tailAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(tailAnim, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // まばたきアニメーション
        const blinkInterval = setInterval(() => {
            Animated.sequence([
                Animated.timing(eyeAnim, {
                    toValue: 0.1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(eyeAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 3000);

        return () => clearInterval(blinkInterval);
    }, []);

    const tailRotation = tailAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-10deg', '20deg'],
    });

    return (
        <View style={styles.container}>
            {/* 猫のキャラクター */}
            <Animated.View
                style={[
                    styles.catContainer,
                    { transform: [{ translateY: bounceAnim }] },
                ]}
            >
                {/* 体 */}
                <View style={styles.body} />

                {/* しっぽ */}
                <Animated.View
                    style={[
                        styles.tail,
                        { transform: [{ rotate: tailRotation }] },
                    ]}
                />

                {/* 顔 */}
                <View style={styles.face}>
                    {/* 耳 */}
                    <View style={styles.ears}>
                        <View style={[styles.ear, styles.earLeft]} />
                        <View style={[styles.ear, styles.earRight]} />
                    </View>

                    {/* 目 */}
                    <View style={styles.eyes}>
                        <Animated.View
                            style={[
                                styles.eye,
                                { transform: [{ scaleY: eyeAnim }] },
                            ]}
                        >
                            <View style={styles.pupil} />
                        </Animated.View>
                        <Animated.View
                            style={[
                                styles.eye,
                                { transform: [{ scaleY: eyeAnim }] },
                            ]}
                        >
                            <View style={styles.pupil} />
                        </Animated.View>
                    </View>

                    {/* 鼻 */}
                    <View style={styles.nose} />

                    {/* ひげ */}
                    <View style={styles.whiskers}>
                        <View style={[styles.whiskerGroup, styles.whiskerLeft]}>
                            <View style={[styles.whisker, { transform: [{ rotate: '-15deg' }] }]} />
                            <View style={styles.whisker} />
                            <View style={[styles.whisker, { transform: [{ rotate: '15deg' }] }]} />
                        </View>
                        <View style={[styles.whiskerGroup, styles.whiskerRight]}>
                            <View style={[styles.whisker, { transform: [{ rotate: '15deg' }] }]} />
                            <View style={styles.whisker} />
                            <View style={[styles.whisker, { transform: [{ rotate: '-15deg' }] }]} />
                        </View>
                    </View>
                </View>
            </Animated.View>

            {/* 吹き出し */}
            <View style={styles.speechBubble}>
                <View style={styles.speechArrow} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    catContainer: {
        width: 80,
        height: 100,
        position: 'relative',
    },
    body: {
        position: 'absolute',
        bottom: 0,
        left: 10,
        width: 60,
        height: 50,
        backgroundColor: '#fbbf24',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    tail: {
        position: 'absolute',
        bottom: 10,
        right: -10,
        width: 30,
        height: 10,
        backgroundColor: '#f59e0b',
        borderRadius: 5,
        transformOrigin: 'left center',
    },
    face: {
        position: 'absolute',
        top: 0,
        left: 12,
        width: 55,
        height: 50,
        backgroundColor: '#fcd34d',
        borderRadius: 28,
    },
    ears: {
        position: 'absolute',
        top: -10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    ear: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 15,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#fbbf24',
    },
    earLeft: {
        transform: [{ rotate: '-15deg' }],
    },
    earRight: {
        transform: [{ rotate: '15deg' }],
    },
    eyes: {
        position: 'absolute',
        top: 15,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    eye: {
        width: 12,
        height: 14,
        backgroundColor: '#1f2937',
        borderRadius: 7,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingTop: 2,
        paddingLeft: 2,
    },
    pupil: {
        width: 4,
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    nose: {
        position: 'absolute',
        top: 28,
        left: 23,
        width: 8,
        height: 6,
        backgroundColor: '#ec4899',
        borderRadius: 4,
    },
    whiskers: {
        position: 'absolute',
        top: 25,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    whiskerGroup: {
        gap: 3,
    },
    whiskerLeft: {
        left: -10,
    },
    whiskerRight: {
        right: -10,
        alignItems: 'flex-end',
    },
    whisker: {
        width: 18,
        height: 1,
        backgroundColor: '#92400e',
    },
    speechBubble: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginLeft: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 2,
        borderColor: '#fed7aa',
        position: 'relative',
    },
    speechArrow: {
        position: 'absolute',
        left: -10,
        top: '50%',
        marginTop: -8,
        width: 0,
        height: 0,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderRightWidth: 10,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: '#fed7aa',
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3f3f46',
        lineHeight: 22,
    },
});

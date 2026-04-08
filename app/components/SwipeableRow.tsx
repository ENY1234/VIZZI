import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
};

export default function SwipeableRow({ children, onDelete, deleteLabel = 'Delete' }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  function renderRightActions(progress: Animated.AnimatedInterpolation<number>) {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View style={{ transform: [{ translateX }] }}>
        <TouchableOpacity
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
          style={{
            backgroundColor: '#E24B4A',
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
            height: '100%',
            borderRadius: 16,
          }}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 10, marginTop: 4 }}>{deleteLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}>
      {children}
    </Swipeable>
  );
}
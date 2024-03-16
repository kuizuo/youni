import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { Like } from '@/ui/icons/like';
import { trpc } from '@/utils/trpc';
import { NoteItem } from '@server/modules/note/note';
import { SizableText, XStack } from 'tamagui';

export interface Props {
  item: NoteItem;
  size?: number;
}

export const NoteLikeButton = ({ item, size = 16 }: Props) => {
  const [liked, setLiked] = useState(item.interact.liked);
  const [likedCount, setLikedCount] = useState(item.interact.likedCount);

  const scale = useSharedValue(1);

  const { mutateAsync: likeNote } = trpc.note.like.useMutation();
  const { mutateAsync: dislikeNote } = trpc.note.dislike.useMutation();

  const handleLike = async () => {
    scale.value = withSpring(1.2);
    runOnJS(toggleLike)();
  };

  const toggleLike = async () => {
    if (liked) {
      await dislikeNote({ id: item.id });
    } else {
      await likeNote({ id: item.id });
    }
    setLiked(!liked);
    setLikedCount(likedCount + (liked ? -1 : 1));
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <XStack gap="$1.5" alignItems='center'>
      <TouchableOpacity onPress={handleLike}>
        <Animated.View style={[animatedStyle]}>
          <Like
            fill={liked ? 'red' : 'transparent'}
            color={liked ? 'red' : 'gray'}
            size={size}
          />
        </Animated.View>
      </TouchableOpacity>
      <SizableText fontSize={14} color={'gray'}>
        {likedCount || ' '}
      </SizableText>
    </XStack>
  );
};


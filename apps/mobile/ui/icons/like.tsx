import { createIcon } from '@gluestack-ui/icon'
import { G, Path } from 'react-native-svg'
import { AsForwarder, styled } from '@gluestack-ui/themed'

const StyledIcon: any = styled(
  AsForwarder,
  {},
  {
    ancestorStyle: ['_icon'],
  },
  {
    propertyTokenMap: {
      stroke: 'colors',
    },
  },
)

const LikeIcon = createIcon({
  Root: StyledIcon,
  viewBox: '0 0 32 32',
  path: (
    <G>
      <Path
        d="M15 8C8.925 8 4 12.925 4 19c0 11 13 21 20 23.326C31 40 44 30 44 19c0-6.075-4.925-11-11-11-3.72 0-7.01 1.847-9 4.674A10.987 10.987 0 0 0 15 8Z"
      />
    </G>
  ),
})

export const Like = LikeIcon

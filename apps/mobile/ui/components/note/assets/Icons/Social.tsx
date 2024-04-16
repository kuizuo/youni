import React from 'react'
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

export const WechatMomentIcon = createIcon({
  Root: StyledIcon,
  viewBox: '0 0 1024 1024',
  path: (
    <Path
      fill="#3C0"
      d="M512 0C229.224 0 0 229.224 0 512s229.224 512 512 512 512-229.224 512-512S794.776 0 512 0zm229.281 282.719c47.218 47.218 66.18 90.757 66.18 90.757L650.525 530.394l-1.801-312.054c.019-.02 45.36 17.161 92.558 64.379zM512 187.733c66.788 0 110.971 17.37 110.971 17.37v221.943L401.048 207.663s44.183-19.93 110.952-19.93zM282.719 282.72c47.237-47.218 90.757-66.18 90.757-66.18l156.918 156.918-312.035 1.782c-.02.02 17.142-45.302 64.36-92.52zM187.733 512c0-66.769 17.39-110.952 17.39-110.952h221.923L207.644 622.952S187.734 578.77 187.734 512zm94.986 229.281c-47.218-47.218-66.18-90.757-66.18-90.757l156.937-156.918 1.801 312.054c-.019 0-45.34-17.161-92.558-64.379zM512 836.267c-66.788 0-110.971-17.37-110.971-17.37V596.954l221.923 219.402c.02 0-44.164 19.91-110.952 19.91zm229.281-94.986c-47.218 47.218-90.757 66.18-90.757 66.18L493.606 650.525l312.054-1.801c.02.019-17.161 45.34-64.379 92.558zm77.597-118.329H596.954L816.356 401.03s19.91 44.183 19.91 110.952c0 66.788-17.388 110.971-17.388 110.971z"
    />
  ),
})

export const WechatIcon: any = createIcon({
  Root: StyledIcon,
  viewBox: '0 0 1024 1024',
  path: (
    <>
      <Path
        fill="#28C445"
        d="M337.387 341.827c-17.757 0-35.514 11.838-35.514 29.595s17.757 29.595 35.514 29.595 29.596-11.838 29.596-29.595c0-18.497-11.838-29.595-29.596-29.595zM577.85 513.48c-11.838 0-22.937 12.578-22.937 23.676 0 12.578 11.838 23.676 22.937 23.676 17.757 0 29.595-11.838 29.595-23.676s-11.838-23.676-29.595-23.676zm-76.208-112.463c17.757 0 29.595-12.578 29.595-29.595 0-17.757-11.838-29.595-29.595-29.595s-35.515 11.838-35.515 29.595 17.757 29.595 35.515 29.595zM706.59 513.48c-11.839 0-22.937 12.578-22.937 23.676 0 12.578 11.838 23.676 22.937 23.676 17.757 0 29.595-11.838 29.595-23.676s-11.838-23.676-29.595-23.676z"
      />
      <Path
        fill="#28C445"
        d="M510.52 2.96C228.624 2.96 0 231.584 0 513.48S228.624 1024 510.52 1024s510.52-228.624 510.52-510.52S792.416 2.96 510.52 2.96zm-96.925 641.48c-29.595 0-53.271-5.92-81.387-12.579l-81.387 41.434 22.936-71.769c-58.45-41.434-93.965-95.445-93.965-159.815 0-113.202 105.803-201.988 233.803-201.988 114.682 0 216.047 71.028 236.023 166.474-7.398-.74-14.797-1.48-22.196-1.48-110.983 1.48-198.29 85.086-198.29 188.67 0 17.018 2.96 33.295 7.4 49.573-7.4.74-15.538 1.48-22.937 1.48zm346.266 82.866 17.757 59.191-63.63-35.514c-22.936 5.919-46.612 11.838-70.289 11.838-111.722 0-199.768-76.948-199.768-172.393-.74-94.705 87.306-171.653 198.289-171.653 105.803 0 199.029 77.687 199.029 172.393 0 53.271-34.775 100.624-81.388 136.138z"
      />
    </>
  ),
})

export const QQIcon: any = createIcon({
  Root: StyledIcon,
  viewBox: '0 0 1024 1024',
  path: (
    <>
      <Path
        fill="#68A5E1"
        d="M512 0C229.224 0 0 229.224 0 512s229.224 512 512 512 512-229.224 512-512S794.776 0 512 0zm289.261 668.862c-21.732 18.64-49.948-61.346-54.006-49.039-9.88 29.924-14.507 49.93-43.634 82.508-1.555 1.745 33.659 14.469 43.634 41.643 9.557 26.017 28.14 67.262-93.488 80.213-71.358 7.585-122.937-38.02-128.076-37.584-9.538.834-5.29 0-15.53 0-8.382 0-8.932.606-16.82 0-2.162-.171-25.885 37.584-131.964 37.584-82.223 0-103.519-51.75-86.983-80.213 16.536-28.463 44.127-36.75 40.24-41.263-19.153-22.187-32.351-45.91-40.24-67.357-1.953-5.347-3.584-10.543-4.873-15.53-2.997-11.454-25.885 67.204-50.46 49.038-24.577-18.167-22.377-64.418-6.467-108.677 16.042-44.62 56.471-87.59 56.927-97.072 1.611-35.29-3.49-41.15 0-50.422 7.755-20.764 17.199-12.8 17.199-23.571 0-135.737 100.864-245.76 225.28-245.76s225.28 110.042 225.28 245.76c0 5.196 13.52 0 19.987 23.571 1.327 4.873 2.238 23.666.664 50.422-.74 12.857 34.266 28.502 52.375 97.072 18.129 68.57 0 100.92-9.045 108.677z"
      />
    </>
  ),
})

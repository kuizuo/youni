type Theme = {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  color6: string;
  color7: string;
  color8: string;
  color9: string;
  color10: string;
  color11: string;
  color12: string;
  background: string;
  backgroundHover: string;
  backgroundPress: string;
  backgroundFocus: string;
  backgroundStrong: string;
  backgroundTransparent: string;
  color: string;
  colorHover: string;
  colorPress: string;
  colorFocus: string;
  colorTransparent: string;
  borderColor: string;
  borderColorHover: string;
  borderColorFocus: string;
  borderColorPress: string;
  placeholderColor: string;
  blue1: string;
  blue2: string;
  blue3: string;
  blue4: string;
  blue5: string;
  blue6: string;
  blue7: string;
  blue8: string;
  blue9: string;
  blue10: string;
  blue11: string;
  blue12: string;
  gray1: string;
  gray2: string;
  gray3: string;
  gray4: string;
  gray5: string;
  gray6: string;
  gray7: string;
  gray8: string;
  gray9: string;
  gray10: string;
  gray11: string;
  gray12: string;
  green1: string;
  green2: string;
  green3: string;
  green4: string;
  green5: string;
  green6: string;
  green7: string;
  green8: string;
  green9: string;
  green10: string;
  green11: string;
  green12: string;
  orange1: string;
  orange2: string;
  orange3: string;
  orange4: string;
  orange5: string;
  orange6: string;
  orange7: string;
  orange8: string;
  orange9: string;
  orange10: string;
  orange11: string;
  orange12: string;
  pink1: string;
  pink2: string;
  pink3: string;
  pink4: string;
  pink5: string;
  pink6: string;
  pink7: string;
  pink8: string;
  pink9: string;
  pink10: string;
  pink11: string;
  pink12: string;
  purple1: string;
  purple2: string;
  purple3: string;
  purple4: string;
  purple5: string;
  purple6: string;
  purple7: string;
  purple8: string;
  purple9: string;
  purple10: string;
  purple11: string;
  purple12: string;
  red1: string;
  red2: string;
  red3: string;
  red4: string;
  red5: string;
  red6: string;
  red7: string;
  red8: string;
  red9: string;
  red10: string;
  red11: string;
  red12: string;
  yellow1: string;
  yellow2: string;
  yellow3: string;
  yellow4: string;
  yellow5: string;
  yellow6: string;
  yellow7: string;
  yellow8: string;
  yellow9: string;
  yellow10: string;
  yellow11: string;
  yellow12: string;
  accent1: string;
  accent2: string;
  accent3: string;
  accent4: string;
  accent5: string;
  accent6: string;
  accent7: string;
  accent8: string;
  accent9: string;
  accent10: string;
  accent11: string;
  accent12: string;
  shadowColor: string;
  shadowColorHover: string;
  shadowColorPress: string;
  shadowColorFocus: string;

}

function t(a: [number, number][]) {
  let res: Record<string,string> = {}
  for (const [ki, vi] of a) {
    res[ks[ki] as string] = vs[vi] as string
  }
  return res as Theme
}
const vs = [
  '#fff',
  '#f9f9f9',
  'hsl(0, 0%, 97.3%)',
  'hsl(0, 0%, 95.1%)',
  'hsl(0, 0%, 94.0%)',
  'hsl(0, 0%, 92.0%)',
  'hsl(0, 0%, 89.5%)',
  'hsl(0, 0%, 81.0%)',
  'hsl(0, 0%, 56.1%)',
  'hsl(0, 0%, 50.3%)',
  'hsl(0, 0%, 42.5%)',
  'hsl(0, 0%, 9.0%)',
  'rgba(255,255,255,0)',
  'rgba(10,10,10,0)',
  'hsl(206, 100%, 99.2%)',
  'hsl(210, 100%, 98.0%)',
  'hsl(209, 100%, 96.5%)',
  'hsl(210, 98.8%, 94.0%)',
  'hsl(209, 95.0%, 90.1%)',
  'hsl(209, 81.2%, 84.5%)',
  'hsl(208, 77.5%, 76.9%)',
  'hsl(206, 81.9%, 65.3%)',
  'hsl(206, 100%, 50.0%)',
  'hsl(208, 100%, 47.3%)',
  'hsl(211, 100%, 43.2%)',
  'hsl(211, 100%, 15.0%)',
  'hsl(0, 0%, 99.0%)',
  'hsl(0, 0%, 93.0%)',
  'hsl(0, 0%, 90.9%)',
  'hsl(0, 0%, 88.7%)',
  'hsl(0, 0%, 85.8%)',
  'hsl(0, 0%, 78.0%)',
  'hsl(0, 0%, 52.3%)',
  'hsl(0, 0%, 43.5%)',
  'hsl(136, 50.0%, 98.9%)',
  'hsl(138, 62.5%, 96.9%)',
  'hsl(139, 55.2%, 94.5%)',
  'hsl(140, 48.7%, 91.0%)',
  'hsl(141, 43.7%, 86.0%)',
  'hsl(143, 40.3%, 79.0%)',
  'hsl(146, 38.5%, 69.0%)',
  'hsl(151, 40.2%, 54.1%)',
  'hsl(151, 55.0%, 41.5%)',
  'hsl(152, 57.5%, 37.6%)',
  'hsl(153, 67.0%, 28.5%)',
  'hsl(155, 40.0%, 14.0%)',
  'hsl(24, 70.0%, 99.0%)',
  'hsl(24, 83.3%, 97.6%)',
  'hsl(24, 100%, 95.3%)',
  'hsl(25, 100%, 92.2%)',
  'hsl(25, 100%, 88.2%)',
  'hsl(25, 100%, 82.8%)',
  'hsl(24, 100%, 75.3%)',
  'hsl(24, 94.5%, 64.3%)',
  'hsl(24, 94.0%, 50.0%)',
  'hsl(24, 100%, 46.5%)',
  'hsl(24, 100%, 37.0%)',
  'hsl(15, 60.0%, 17.0%)',
  'hsl(322, 100%, 99.4%)',
  'hsl(323, 100%, 98.4%)',
  'hsl(323, 86.3%, 96.5%)',
  'hsl(323, 78.7%, 94.2%)',
  'hsl(323, 72.2%, 91.1%)',
  'hsl(323, 66.3%, 86.6%)',
  'hsl(323, 62.0%, 80.1%)',
  'hsl(323, 60.3%, 72.4%)',
  'hsl(322, 65.0%, 54.5%)',
  'hsl(322, 63.9%, 50.7%)',
  'hsl(322, 75.0%, 46.0%)',
  'hsl(320, 70.0%, 13.5%)',
  'hsl(280, 65.0%, 99.4%)',
  'hsl(276, 100%, 99.0%)',
  'hsl(276, 83.1%, 97.0%)',
  'hsl(275, 76.4%, 94.7%)',
  'hsl(275, 70.8%, 91.8%)',
  'hsl(274, 65.4%, 87.8%)',
  'hsl(273, 61.0%, 81.7%)',
  'hsl(272, 60.0%, 73.5%)',
  'hsl(272, 51.0%, 54.0%)',
  'hsl(272, 46.8%, 50.3%)',
  'hsl(272, 50.0%, 45.8%)',
  'hsl(272, 66.0%, 16.0%)',
  'hsl(359, 100%, 99.4%)',
  'hsl(359, 100%, 98.6%)',
  'hsl(360, 100%, 96.8%)',
  'hsl(360, 97.9%, 94.8%)',
  'hsl(360, 90.2%, 91.9%)',
  'hsl(360, 81.7%, 87.8%)',
  'hsl(359, 74.2%, 81.7%)',
  'hsl(359, 69.5%, 74.3%)',
  'hsl(358, 75.0%, 59.0%)',
  'hsl(358, 69.4%, 55.2%)',
  'hsl(358, 65.0%, 48.7%)',
  'hsl(354, 50.0%, 14.6%)',
  'hsl(60, 54.0%, 98.5%)',
  'hsl(52, 100%, 95.5%)',
  'hsl(55, 100%, 90.9%)',
  'hsl(54, 100%, 86.6%)',
  'hsl(52, 97.9%, 82.0%)',
  'hsl(50, 89.4%, 76.1%)',
  'hsl(47, 80.4%, 68.0%)',
  'hsl(48, 100%, 46.1%)',
  'hsl(53, 92.0%, 50.0%)',
  'hsl(50, 100%, 48.5%)',
  'hsl(42, 100%, 29.0%)',
  'hsl(40, 55.0%, 13.5%)',
  'rgba(0,0,0,0.066)',
  'rgba(0,0,0,0.02)',
  '#050505',
  '#151515',
  '#191919',
  '#232323',
  '#282828',
  '#323232',
  '#424242',
  '#494949',
  '#545454',
  '#626262',
  '#a5a5a5',
  'hsl(212, 35.0%, 9.2%)',
  'hsl(216, 50.0%, 11.8%)',
  'hsl(214, 59.4%, 15.3%)',
  'hsl(214, 65.8%, 17.9%)',
  'hsl(213, 71.2%, 20.2%)',
  'hsl(212, 77.4%, 23.1%)',
  'hsl(211, 85.1%, 27.4%)',
  'hsl(211, 89.7%, 34.1%)',
  'hsl(209, 100%, 60.6%)',
  'hsl(210, 100%, 66.1%)',
  'hsl(206, 98.0%, 95.8%)',
  'hsl(0, 0%, 8.5%)',
  'hsl(0, 0%, 11.0%)',
  'hsl(0, 0%, 13.6%)',
  'hsl(0, 0%, 15.8%)',
  'hsl(0, 0%, 17.9%)',
  'hsl(0, 0%, 20.5%)',
  'hsl(0, 0%, 24.3%)',
  'hsl(0, 0%, 31.2%)',
  'hsl(0, 0%, 43.9%)',
  'hsl(0, 0%, 49.4%)',
  'hsl(0, 0%, 62.8%)',
  'hsl(146, 30.0%, 7.4%)',
  'hsl(155, 44.2%, 8.4%)',
  'hsl(155, 46.7%, 10.9%)',
  'hsl(154, 48.4%, 12.9%)',
  'hsl(154, 49.7%, 14.9%)',
  'hsl(154, 50.9%, 17.6%)',
  'hsl(153, 51.8%, 21.8%)',
  'hsl(151, 51.7%, 28.4%)',
  'hsl(151, 49.3%, 46.5%)',
  'hsl(151, 50.0%, 53.2%)',
  'hsl(137, 72.0%, 94.0%)',
  'hsl(30, 70.0%, 7.2%)',
  'hsl(28, 100%, 8.4%)',
  'hsl(26, 91.1%, 11.6%)',
  'hsl(25, 88.3%, 14.1%)',
  'hsl(24, 87.6%, 16.6%)',
  'hsl(24, 88.6%, 19.8%)',
  'hsl(24, 92.4%, 24.0%)',
  'hsl(25, 100%, 29.0%)',
  'hsl(24, 100%, 58.5%)',
  'hsl(24, 100%, 62.2%)',
  'hsl(24, 97.0%, 93.2%)',
  'hsl(318, 25.0%, 9.6%)',
  'hsl(319, 32.2%, 11.6%)',
  'hsl(319, 41.0%, 16.0%)',
  'hsl(320, 45.4%, 18.7%)',
  'hsl(320, 49.0%, 21.1%)',
  'hsl(321, 53.6%, 24.4%)',
  'hsl(321, 61.1%, 29.7%)',
  'hsl(322, 74.9%, 37.5%)',
  'hsl(323, 72.8%, 59.2%)',
  'hsl(325, 90.0%, 66.4%)',
  'hsl(322, 90.0%, 95.8%)',
  'hsl(284, 20.0%, 9.6%)',
  'hsl(283, 30.0%, 11.8%)',
  'hsl(281, 37.5%, 16.5%)',
  'hsl(280, 41.2%, 20.0%)',
  'hsl(279, 43.8%, 23.3%)',
  'hsl(277, 46.4%, 27.5%)',
  'hsl(275, 49.3%, 34.6%)',
  'hsl(272, 52.1%, 45.9%)',
  'hsl(273, 57.3%, 59.1%)',
  'hsl(275, 80.0%, 71.0%)',
  'hsl(279, 75.0%, 95.7%)',
  'hsl(353, 23.0%, 9.8%)',
  'hsl(357, 34.4%, 12.0%)',
  'hsl(356, 43.4%, 16.4%)',
  'hsl(356, 47.6%, 19.2%)',
  'hsl(356, 51.1%, 21.9%)',
  'hsl(356, 55.2%, 25.9%)',
  'hsl(357, 60.2%, 31.8%)',
  'hsl(358, 65.0%, 40.4%)',
  'hsl(358, 85.3%, 64.0%)',
  'hsl(358, 100%, 69.5%)',
  'hsl(351, 89.0%, 96.0%)',
  'hsl(45, 100%, 5.5%)',
  'hsl(46, 100%, 6.7%)',
  'hsl(45, 100%, 8.7%)',
  'hsl(45, 100%, 10.4%)',
  'hsl(47, 100%, 12.1%)',
  'hsl(49, 100%, 14.3%)',
  'hsl(49, 90.3%, 18.4%)',
  'hsl(50, 100%, 22.0%)',
  'hsl(54, 100%, 68.0%)',
  'hsl(48, 100%, 47.0%)',
  'hsl(53, 100%, 91.0%)',
  'rgba(0,0,0,0.3)',
  'rgba(0,0,0,0.2)',
  'hsla(24, 70.0%, 99.0%, 0)',
  'hsla(15, 60.0%, 17.0%, 0)',
  'hsla(60, 54.0%, 98.5%, 0)',
  'hsla(40, 55.0%, 13.5%, 0)',
  'hsla(136, 50.0%, 98.9%, 0)',
  'hsla(155, 40.0%, 14.0%, 0)',
  'hsla(206, 100%, 99.2%, 0)',
  'hsla(211, 100%, 15.0%, 0)',
  'hsla(280, 65.0%, 99.4%, 0)',
  'hsla(272, 66.0%, 16.0%, 0)',
  'hsla(322, 100%, 99.4%, 0)',
  'hsla(320, 70.0%, 13.5%, 0)',
  'hsla(359, 100%, 99.4%, 0)',
  'hsla(354, 50.0%, 14.6%, 0)',
  'hsla(30, 70.0%, 7.2%, 0)',
  'hsla(24, 97.0%, 93.2%, 0)',
  'hsla(45, 100%, 5.5%, 0)',
  'hsla(53, 100%, 91.0%, 0)',
  'hsla(146, 30.0%, 7.4%, 0)',
  'hsla(137, 72.0%, 94.0%, 0)',
  'hsla(212, 35.0%, 9.2%, 0)',
  'hsla(206, 98.0%, 95.8%, 0)',
  'hsla(284, 20.0%, 9.6%, 0)',
  'hsla(279, 75.0%, 95.7%, 0)',
  'hsla(318, 25.0%, 9.6%, 0)',
  'hsla(322, 90.0%, 95.8%, 0)',
  'hsla(353, 23.0%, 9.8%, 0)',
  'hsla(351, 89.0%, 96.0%, 0)',
  'rgba(0,0,0,0.5)',
  'rgba(0,0,0,0.9)',
  'transparent',
]

const ks = [
'color1',
'color2',
'color3',
'color4',
'color5',
'color6',
'color7',
'color8',
'color9',
'color10',
'color11',
'color12',
'background',
'backgroundHover',
'backgroundPress',
'backgroundFocus',
'backgroundStrong',
'backgroundTransparent',
'color',
'colorHover',
'colorPress',
'colorFocus',
'colorTransparent',
'borderColor',
'borderColorHover',
'borderColorFocus',
'borderColorPress',
'placeholderColor',
'blue1',
'blue2',
'blue3',
'blue4',
'blue5',
'blue6',
'blue7',
'blue8',
'blue9',
'blue10',
'blue11',
'blue12',
'gray1',
'gray2',
'gray3',
'gray4',
'gray5',
'gray6',
'gray7',
'gray8',
'gray9',
'gray10',
'gray11',
'gray12',
'green1',
'green2',
'green3',
'green4',
'green5',
'green6',
'green7',
'green8',
'green9',
'green10',
'green11',
'green12',
'orange1',
'orange2',
'orange3',
'orange4',
'orange5',
'orange6',
'orange7',
'orange8',
'orange9',
'orange10',
'orange11',
'orange12',
'pink1',
'pink2',
'pink3',
'pink4',
'pink5',
'pink6',
'pink7',
'pink8',
'pink9',
'pink10',
'pink11',
'pink12',
'purple1',
'purple2',
'purple3',
'purple4',
'purple5',
'purple6',
'purple7',
'purple8',
'purple9',
'purple10',
'purple11',
'purple12',
'red1',
'red2',
'red3',
'red4',
'red5',
'red6',
'red7',
'red8',
'red9',
'red10',
'red11',
'red12',
'yellow1',
'yellow2',
'yellow3',
'yellow4',
'yellow5',
'yellow6',
'yellow7',
'yellow8',
'yellow9',
'yellow10',
'yellow11',
'yellow12',
'accent1',
'accent2',
'accent3',
'accent4',
'accent5',
'accent6',
'accent7',
'accent8',
'accent9',
'accent10',
'accent11',
'accent12',
'shadowColor',
'shadowColorHover',
'shadowColorPress',
'shadowColorFocus']


const n1 = t([[0, 0],[1, 1],[2, 2],[3, 3],[4, 4],[5, 5],[6, 6],[7, 7],[8, 8],[9, 9],[10, 10],[11, 11],[12, 1],[13, 2],[14, 3],[15, 4],[16, 0],[17, 12],[18, 11],[19, 10],[20, 11],[21, 10],[22, 13],[23, 4],[24, 5],[25, 3],[26, 4],[27, 8],[28, 14],[29, 15],[30, 16],[31, 17],[32, 18],[33, 19],[34, 20],[35, 21],[36, 22],[37, 23],[38, 24],[39, 25],[40, 26],[41, 2],[42, 3],[43, 27],[44, 28],[45, 29],[46, 30],[47, 31],[48, 8],[49, 32],[50, 33],[51, 11],[52, 34],[53, 35],[54, 36],[55, 37],[56, 38],[57, 39],[58, 40],[59, 41],[60, 42],[61, 43],[62, 44],[63, 45],[64, 46],[65, 47],[66, 48],[67, 49],[68, 50],[69, 51],[70, 52],[71, 53],[72, 54],[73, 55],[74, 56],[75, 57],[76, 58],[77, 59],[78, 60],[79, 61],[80, 62],[81, 63],[82, 64],[83, 65],[84, 66],[85, 67],[86, 68],[87, 69],[88, 70],[89, 71],[90, 72],[91, 73],[92, 74],[93, 75],[94, 76],[95, 77],[96, 78],[97, 79],[98, 80],[99, 81],[100, 82],[101, 83],[102, 84],[103, 85],[104, 86],[105, 87],[106, 88],[107, 89],[108, 90],[109, 91],[110, 92],[111, 93],[112, 94],[113, 95],[114, 96],[115, 97],[116, 98],[117, 99],[118, 100],[119, 101],[120, 102],[121, 103],[122, 104],[123, 105],[124, 82],[125, 83],[126, 84],[127, 85],[128, 86],[129, 87],[130, 88],[131, 89],[132, 90],[133, 91],[134, 92],[135, 93],[136, 106],[137, 106],[138, 107],[139, 107]])

export const light = n1
const n2 = t([[0, 108],[1, 109],[2, 110],[3, 111],[4, 112],[5, 113],[6, 114],[7, 115],[8, 116],[9, 117],[10, 118],[11, 0],[12, 109],[13, 110],[14, 111],[15, 112],[16, 108],[17, 13],[18, 0],[19, 118],[20, 0],[21, 118],[22, 12],[23, 112],[24, 113],[25, 111],[26, 112],[27, 116],[28, 119],[29, 120],[30, 121],[31, 122],[32, 123],[33, 124],[34, 125],[35, 126],[36, 22],[37, 127],[38, 128],[39, 129],[40, 130],[41, 131],[42, 132],[43, 133],[44, 134],[45, 135],[46, 136],[47, 137],[48, 138],[49, 139],[50, 140],[51, 27],[52, 141],[53, 142],[54, 143],[55, 144],[56, 145],[57, 146],[58, 147],[59, 148],[60, 42],[61, 149],[62, 150],[63, 151],[64, 152],[65, 153],[66, 154],[67, 155],[68, 156],[69, 157],[70, 158],[71, 159],[72, 54],[73, 160],[74, 161],[75, 162],[76, 163],[77, 164],[78, 165],[79, 166],[80, 167],[81, 168],[82, 169],[83, 170],[84, 66],[85, 171],[86, 172],[87, 173],[88, 174],[89, 175],[90, 176],[91, 177],[92, 178],[93, 179],[94, 180],[95, 181],[96, 78],[97, 182],[98, 183],[99, 184],[100, 185],[101, 186],[102, 187],[103, 188],[104, 189],[105, 190],[106, 191],[107, 192],[108, 90],[109, 193],[110, 194],[111, 195],[112, 196],[113, 197],[114, 198],[115, 199],[116, 200],[117, 201],[118, 202],[119, 203],[120, 102],[121, 204],[122, 205],[123, 206],[124, 185],[125, 186],[126, 187],[127, 188],[128, 189],[129, 190],[130, 191],[131, 192],[132, 90],[133, 193],[134, 194],[135, 195],[136, 207],[137, 207],[138, 208],[139, 208]])

export const dark = n2
const n3 = t([[0, 46],[1, 47],[2, 48],[3, 49],[4, 50],[5, 51],[6, 53],[7, 54],[8, 55],[9, 56],[10, 57],[11, 11],[12, 47],[13, 48],[14, 49],[15, 50],[16, 46],[17, 209],[18, 11],[19, 57],[20, 11],[21, 57],[22, 210],[23, 49],[24, 50],[25, 49],[26, 49],[27, 55]])

export const light_orange = n3
const n4 = t([[0, 94],[1, 95],[2, 96],[3, 97],[4, 98],[5, 99],[6, 101],[7, 102],[8, 103],[9, 104],[10, 105],[11, 11],[12, 95],[13, 96],[14, 97],[15, 98],[16, 94],[17, 211],[18, 11],[19, 105],[20, 11],[21, 105],[22, 212],[23, 97],[24, 98],[25, 97],[26, 97],[27, 103]])

export const light_yellow = n4
const n5 = t([[0, 34],[1, 35],[2, 36],[3, 37],[4, 38],[5, 39],[6, 41],[7, 42],[8, 43],[9, 44],[10, 45],[11, 11],[12, 35],[13, 36],[14, 37],[15, 38],[16, 34],[17, 213],[18, 11],[19, 45],[20, 11],[21, 45],[22, 214],[23, 37],[24, 38],[25, 37],[26, 37],[27, 43]])

export const light_green = n5
const n6 = t([[0, 14],[1, 15],[2, 16],[3, 17],[4, 18],[5, 19],[6, 21],[7, 22],[8, 23],[9, 24],[10, 25],[11, 11],[12, 15],[13, 16],[14, 17],[15, 18],[16, 14],[17, 215],[18, 11],[19, 25],[20, 11],[21, 25],[22, 216],[23, 17],[24, 18],[25, 17],[26, 17],[27, 23]])

export const light_blue = n6
const n7 = t([[0, 70],[1, 71],[2, 72],[3, 73],[4, 74],[5, 75],[6, 77],[7, 78],[8, 79],[9, 80],[10, 81],[11, 11],[12, 71],[13, 72],[14, 73],[15, 74],[16, 70],[17, 217],[18, 11],[19, 81],[20, 11],[21, 81],[22, 218],[23, 73],[24, 74],[25, 73],[26, 73],[27, 79]])

export const light_purple = n7
const n8 = t([[0, 58],[1, 59],[2, 60],[3, 61],[4, 62],[5, 63],[6, 65],[7, 66],[8, 67],[9, 68],[10, 69],[11, 11],[12, 59],[13, 60],[14, 61],[15, 62],[16, 58],[17, 219],[18, 11],[19, 69],[20, 11],[21, 69],[22, 220],[23, 61],[24, 62],[25, 61],[26, 61],[27, 67]])

export const light_pink = n8
const n9 = t([[0, 82],[1, 83],[2, 84],[3, 85],[4, 86],[5, 87],[6, 89],[7, 90],[8, 91],[9, 92],[10, 93],[11, 11],[12, 83],[13, 84],[14, 85],[15, 86],[16, 82],[17, 221],[18, 11],[19, 93],[20, 11],[21, 93],[22, 222],[23, 85],[24, 86],[25, 85],[26, 85],[27, 91]])

export const light_red = n9
export const light_accent = n9
const n10 = t([[0, 152],[1, 153],[2, 154],[3, 155],[4, 156],[5, 157],[6, 159],[7, 54],[8, 160],[9, 161],[10, 162],[11, 0],[12, 153],[13, 154],[14, 155],[15, 156],[16, 152],[17, 223],[18, 0],[19, 162],[20, 0],[21, 162],[22, 224],[23, 156],[24, 157],[25, 155],[26, 156],[27, 160]])

export const dark_orange = n10
const n11 = t([[0, 196],[1, 197],[2, 198],[3, 199],[4, 200],[5, 201],[6, 203],[7, 102],[8, 204],[9, 205],[10, 206],[11, 0],[12, 197],[13, 198],[14, 199],[15, 200],[16, 196],[17, 225],[18, 0],[19, 206],[20, 0],[21, 206],[22, 226],[23, 200],[24, 201],[25, 199],[26, 200],[27, 204]])

export const dark_yellow = n11
const n12 = t([[0, 141],[1, 142],[2, 143],[3, 144],[4, 145],[5, 146],[6, 148],[7, 42],[8, 149],[9, 150],[10, 151],[11, 0],[12, 142],[13, 143],[14, 144],[15, 145],[16, 141],[17, 227],[18, 0],[19, 151],[20, 0],[21, 151],[22, 228],[23, 145],[24, 146],[25, 144],[26, 145],[27, 149]])

export const dark_green = n12
const n13 = t([[0, 119],[1, 120],[2, 121],[3, 122],[4, 123],[5, 124],[6, 126],[7, 22],[8, 127],[9, 128],[10, 129],[11, 0],[12, 120],[13, 121],[14, 122],[15, 123],[16, 119],[17, 229],[18, 0],[19, 129],[20, 0],[21, 129],[22, 230],[23, 123],[24, 124],[25, 122],[26, 123],[27, 127]])

export const dark_blue = n13
const n14 = t([[0, 174],[1, 175],[2, 176],[3, 177],[4, 178],[5, 179],[6, 181],[7, 78],[8, 182],[9, 183],[10, 184],[11, 0],[12, 175],[13, 176],[14, 177],[15, 178],[16, 174],[17, 231],[18, 0],[19, 184],[20, 0],[21, 184],[22, 232],[23, 178],[24, 179],[25, 177],[26, 178],[27, 182]])

export const dark_purple = n14
const n15 = t([[0, 163],[1, 164],[2, 165],[3, 166],[4, 167],[5, 168],[6, 170],[7, 66],[8, 171],[9, 172],[10, 173],[11, 0],[12, 164],[13, 165],[14, 166],[15, 167],[16, 163],[17, 233],[18, 0],[19, 173],[20, 0],[21, 173],[22, 234],[23, 167],[24, 168],[25, 166],[26, 167],[27, 171]])

export const dark_pink = n15
const n16 = t([[0, 185],[1, 186],[2, 187],[3, 188],[4, 189],[5, 190],[6, 192],[7, 90],[8, 193],[9, 194],[10, 195],[11, 0],[12, 186],[13, 187],[14, 188],[15, 189],[16, 185],[17, 235],[18, 0],[19, 195],[20, 0],[21, 195],[22, 236],[23, 189],[24, 190],[25, 188],[26, 189],[27, 193]])

export const dark_red = n16
export const dark_accent = n16
const n17 = t([[12, 237]])

export const light_SheetOverlay = n17
export const light_DialogOverlay = n17
export const light_ModalOverlay = n17
export const light_orange_SheetOverlay = n17
export const light_orange_DialogOverlay = n17
export const light_orange_ModalOverlay = n17
export const light_yellow_SheetOverlay = n17
export const light_yellow_DialogOverlay = n17
export const light_yellow_ModalOverlay = n17
export const light_green_SheetOverlay = n17
export const light_green_DialogOverlay = n17
export const light_green_ModalOverlay = n17
export const light_blue_SheetOverlay = n17
export const light_blue_DialogOverlay = n17
export const light_blue_ModalOverlay = n17
export const light_purple_SheetOverlay = n17
export const light_purple_DialogOverlay = n17
export const light_purple_ModalOverlay = n17
export const light_pink_SheetOverlay = n17
export const light_pink_DialogOverlay = n17
export const light_pink_ModalOverlay = n17
export const light_red_SheetOverlay = n17
export const light_red_DialogOverlay = n17
export const light_red_ModalOverlay = n17
export const light_accent_SheetOverlay = n17
export const light_accent_DialogOverlay = n17
export const light_accent_ModalOverlay = n17
export const light_alt1_SheetOverlay = n17
export const light_alt1_DialogOverlay = n17
export const light_alt1_ModalOverlay = n17
export const light_alt2_SheetOverlay = n17
export const light_alt2_DialogOverlay = n17
export const light_alt2_ModalOverlay = n17
export const light_active_SheetOverlay = n17
export const light_active_DialogOverlay = n17
export const light_active_ModalOverlay = n17
export const light_orange_alt1_SheetOverlay = n17
export const light_orange_alt1_DialogOverlay = n17
export const light_orange_alt1_ModalOverlay = n17
export const light_orange_alt2_SheetOverlay = n17
export const light_orange_alt2_DialogOverlay = n17
export const light_orange_alt2_ModalOverlay = n17
export const light_orange_active_SheetOverlay = n17
export const light_orange_active_DialogOverlay = n17
export const light_orange_active_ModalOverlay = n17
export const light_yellow_alt1_SheetOverlay = n17
export const light_yellow_alt1_DialogOverlay = n17
export const light_yellow_alt1_ModalOverlay = n17
export const light_yellow_alt2_SheetOverlay = n17
export const light_yellow_alt2_DialogOverlay = n17
export const light_yellow_alt2_ModalOverlay = n17
export const light_yellow_active_SheetOverlay = n17
export const light_yellow_active_DialogOverlay = n17
export const light_yellow_active_ModalOverlay = n17
export const light_green_alt1_SheetOverlay = n17
export const light_green_alt1_DialogOverlay = n17
export const light_green_alt1_ModalOverlay = n17
export const light_green_alt2_SheetOverlay = n17
export const light_green_alt2_DialogOverlay = n17
export const light_green_alt2_ModalOverlay = n17
export const light_green_active_SheetOverlay = n17
export const light_green_active_DialogOverlay = n17
export const light_green_active_ModalOverlay = n17
export const light_blue_alt1_SheetOverlay = n17
export const light_blue_alt1_DialogOverlay = n17
export const light_blue_alt1_ModalOverlay = n17
export const light_blue_alt2_SheetOverlay = n17
export const light_blue_alt2_DialogOverlay = n17
export const light_blue_alt2_ModalOverlay = n17
export const light_blue_active_SheetOverlay = n17
export const light_blue_active_DialogOverlay = n17
export const light_blue_active_ModalOverlay = n17
export const light_purple_alt1_SheetOverlay = n17
export const light_purple_alt1_DialogOverlay = n17
export const light_purple_alt1_ModalOverlay = n17
export const light_purple_alt2_SheetOverlay = n17
export const light_purple_alt2_DialogOverlay = n17
export const light_purple_alt2_ModalOverlay = n17
export const light_purple_active_SheetOverlay = n17
export const light_purple_active_DialogOverlay = n17
export const light_purple_active_ModalOverlay = n17
export const light_pink_alt1_SheetOverlay = n17
export const light_pink_alt1_DialogOverlay = n17
export const light_pink_alt1_ModalOverlay = n17
export const light_pink_alt2_SheetOverlay = n17
export const light_pink_alt2_DialogOverlay = n17
export const light_pink_alt2_ModalOverlay = n17
export const light_pink_active_SheetOverlay = n17
export const light_pink_active_DialogOverlay = n17
export const light_pink_active_ModalOverlay = n17
export const light_red_alt1_SheetOverlay = n17
export const light_red_alt1_DialogOverlay = n17
export const light_red_alt1_ModalOverlay = n17
export const light_red_alt2_SheetOverlay = n17
export const light_red_alt2_DialogOverlay = n17
export const light_red_alt2_ModalOverlay = n17
export const light_red_active_SheetOverlay = n17
export const light_red_active_DialogOverlay = n17
export const light_red_active_ModalOverlay = n17
export const light_accent_alt1_SheetOverlay = n17
export const light_accent_alt1_DialogOverlay = n17
export const light_accent_alt1_ModalOverlay = n17
export const light_accent_alt2_SheetOverlay = n17
export const light_accent_alt2_DialogOverlay = n17
export const light_accent_alt2_ModalOverlay = n17
export const light_accent_active_SheetOverlay = n17
export const light_accent_active_DialogOverlay = n17
export const light_accent_active_ModalOverlay = n17
const n18 = t([[12, 238]])

export const dark_SheetOverlay = n18
export const dark_DialogOverlay = n18
export const dark_ModalOverlay = n18
export const dark_orange_SheetOverlay = n18
export const dark_orange_DialogOverlay = n18
export const dark_orange_ModalOverlay = n18
export const dark_yellow_SheetOverlay = n18
export const dark_yellow_DialogOverlay = n18
export const dark_yellow_ModalOverlay = n18
export const dark_green_SheetOverlay = n18
export const dark_green_DialogOverlay = n18
export const dark_green_ModalOverlay = n18
export const dark_blue_SheetOverlay = n18
export const dark_blue_DialogOverlay = n18
export const dark_blue_ModalOverlay = n18
export const dark_purple_SheetOverlay = n18
export const dark_purple_DialogOverlay = n18
export const dark_purple_ModalOverlay = n18
export const dark_pink_SheetOverlay = n18
export const dark_pink_DialogOverlay = n18
export const dark_pink_ModalOverlay = n18
export const dark_red_SheetOverlay = n18
export const dark_red_DialogOverlay = n18
export const dark_red_ModalOverlay = n18
export const dark_accent_SheetOverlay = n18
export const dark_accent_DialogOverlay = n18
export const dark_accent_ModalOverlay = n18
export const dark_alt1_SheetOverlay = n18
export const dark_alt1_DialogOverlay = n18
export const dark_alt1_ModalOverlay = n18
export const dark_alt2_SheetOverlay = n18
export const dark_alt2_DialogOverlay = n18
export const dark_alt2_ModalOverlay = n18
export const dark_active_SheetOverlay = n18
export const dark_active_DialogOverlay = n18
export const dark_active_ModalOverlay = n18
export const dark_orange_alt1_SheetOverlay = n18
export const dark_orange_alt1_DialogOverlay = n18
export const dark_orange_alt1_ModalOverlay = n18
export const dark_orange_alt2_SheetOverlay = n18
export const dark_orange_alt2_DialogOverlay = n18
export const dark_orange_alt2_ModalOverlay = n18
export const dark_orange_active_SheetOverlay = n18
export const dark_orange_active_DialogOverlay = n18
export const dark_orange_active_ModalOverlay = n18
export const dark_yellow_alt1_SheetOverlay = n18
export const dark_yellow_alt1_DialogOverlay = n18
export const dark_yellow_alt1_ModalOverlay = n18
export const dark_yellow_alt2_SheetOverlay = n18
export const dark_yellow_alt2_DialogOverlay = n18
export const dark_yellow_alt2_ModalOverlay = n18
export const dark_yellow_active_SheetOverlay = n18
export const dark_yellow_active_DialogOverlay = n18
export const dark_yellow_active_ModalOverlay = n18
export const dark_green_alt1_SheetOverlay = n18
export const dark_green_alt1_DialogOverlay = n18
export const dark_green_alt1_ModalOverlay = n18
export const dark_green_alt2_SheetOverlay = n18
export const dark_green_alt2_DialogOverlay = n18
export const dark_green_alt2_ModalOverlay = n18
export const dark_green_active_SheetOverlay = n18
export const dark_green_active_DialogOverlay = n18
export const dark_green_active_ModalOverlay = n18
export const dark_blue_alt1_SheetOverlay = n18
export const dark_blue_alt1_DialogOverlay = n18
export const dark_blue_alt1_ModalOverlay = n18
export const dark_blue_alt2_SheetOverlay = n18
export const dark_blue_alt2_DialogOverlay = n18
export const dark_blue_alt2_ModalOverlay = n18
export const dark_blue_active_SheetOverlay = n18
export const dark_blue_active_DialogOverlay = n18
export const dark_blue_active_ModalOverlay = n18
export const dark_purple_alt1_SheetOverlay = n18
export const dark_purple_alt1_DialogOverlay = n18
export const dark_purple_alt1_ModalOverlay = n18
export const dark_purple_alt2_SheetOverlay = n18
export const dark_purple_alt2_DialogOverlay = n18
export const dark_purple_alt2_ModalOverlay = n18
export const dark_purple_active_SheetOverlay = n18
export const dark_purple_active_DialogOverlay = n18
export const dark_purple_active_ModalOverlay = n18
export const dark_pink_alt1_SheetOverlay = n18
export const dark_pink_alt1_DialogOverlay = n18
export const dark_pink_alt1_ModalOverlay = n18
export const dark_pink_alt2_SheetOverlay = n18
export const dark_pink_alt2_DialogOverlay = n18
export const dark_pink_alt2_ModalOverlay = n18
export const dark_pink_active_SheetOverlay = n18
export const dark_pink_active_DialogOverlay = n18
export const dark_pink_active_ModalOverlay = n18
export const dark_red_alt1_SheetOverlay = n18
export const dark_red_alt1_DialogOverlay = n18
export const dark_red_alt1_ModalOverlay = n18
export const dark_red_alt2_SheetOverlay = n18
export const dark_red_alt2_DialogOverlay = n18
export const dark_red_alt2_ModalOverlay = n18
export const dark_red_active_SheetOverlay = n18
export const dark_red_active_DialogOverlay = n18
export const dark_red_active_ModalOverlay = n18
export const dark_accent_alt1_SheetOverlay = n18
export const dark_accent_alt1_DialogOverlay = n18
export const dark_accent_alt1_ModalOverlay = n18
export const dark_accent_alt2_SheetOverlay = n18
export const dark_accent_alt2_DialogOverlay = n18
export const dark_accent_alt2_ModalOverlay = n18
export const dark_accent_active_SheetOverlay = n18
export const dark_accent_active_DialogOverlay = n18
export const dark_accent_active_ModalOverlay = n18
const n19 = t([[0, 1],[1, 2],[2, 3],[3, 4],[4, 5],[5, 6],[6, 7],[7, 8],[8, 9],[9, 10],[10, 11],[11, 11],[12, 2],[13, 3],[14, 4],[15, 5],[16, 1],[17, 0],[18, 10],[19, 9],[20, 10],[21, 9],[22, 11],[23, 5],[24, 6],[25, 4],[26, 5],[27, 7]])

export const light_alt1 = n19
const n20 = t([[0, 2],[1, 3],[2, 4],[3, 5],[4, 6],[5, 7],[6, 8],[7, 9],[8, 10],[9, 11],[10, 11],[11, 11],[12, 3],[13, 4],[14, 5],[15, 6],[16, 2],[17, 1],[18, 9],[19, 8],[20, 9],[21, 8],[22, 10],[23, 6],[24, 7],[25, 5],[26, 6],[27, 6]])

export const light_alt2 = n20
const n21 = t([[0, 3],[1, 4],[2, 5],[3, 6],[4, 7],[5, 8],[6, 9],[7, 10],[8, 11],[9, 13],[10, 13],[11, 13],[12, 4],[13, 5],[14, 6],[15, 7],[16, 3],[17, 2],[19, 7],[20, 8],[21, 7],[22, 9],[23, 7],[24, 8],[25, 6],[26, 7],[27, 5]])

export const light_active = n21
const n22 = t([[0, 109],[1, 110],[2, 111],[3, 112],[4, 113],[5, 114],[6, 115],[7, 116],[8, 117],[9, 118],[10, 0],[11, 0],[12, 110],[13, 111],[14, 112],[15, 113],[16, 109],[17, 108],[18, 118],[19, 117],[20, 118],[21, 117],[22, 0],[23, 113],[24, 114],[25, 112],[26, 113],[27, 115]])

export const dark_alt1 = n22
const n23 = t([[0, 110],[1, 111],[2, 112],[3, 113],[4, 114],[5, 115],[6, 116],[7, 117],[8, 118],[9, 0],[10, 0],[11, 0],[12, 111],[13, 112],[14, 113],[15, 114],[16, 110],[17, 109],[18, 117],[19, 116],[20, 117],[21, 116],[22, 118],[23, 114],[24, 115],[25, 113],[26, 114],[27, 114]])

export const dark_alt2 = n23
const n24 = t([[0, 111],[1, 112],[2, 113],[3, 114],[4, 115],[5, 116],[6, 117],[7, 118],[8, 0],[9, 12],[10, 12],[11, 12],[12, 112],[13, 113],[14, 114],[15, 115],[16, 111],[17, 110],[19, 115],[20, 116],[21, 115],[22, 117],[23, 115],[24, 116],[25, 114],[26, 115],[27, 113]])

export const dark_active = n24
const n25 = t([[0, 47],[1, 48],[2, 49],[3, 50],[4, 51],[5, 53],[6, 54],[7, 55],[8, 56],[9, 57],[10, 11],[11, 11],[12, 48],[13, 49],[14, 50],[15, 51],[16, 47],[17, 46],[18, 57],[19, 56],[20, 57],[21, 56],[22, 11],[23, 50],[24, 51],[25, 50],[26, 50],[27, 54]])

export const light_orange_alt1 = n25
const n26 = t([[0, 48],[1, 49],[2, 50],[3, 51],[4, 53],[5, 54],[6, 55],[7, 56],[8, 57],[9, 11],[10, 11],[11, 11],[12, 49],[13, 50],[14, 51],[15, 53],[16, 48],[17, 47],[18, 56],[19, 55],[20, 56],[21, 55],[22, 57],[23, 51],[24, 53],[25, 51],[26, 51],[27, 53]])

export const light_orange_alt2 = n26
const n27 = t([[0, 49],[1, 50],[2, 51],[3, 53],[4, 54],[5, 55],[6, 56],[7, 57],[8, 11],[9, 210],[10, 210],[11, 210],[12, 50],[13, 51],[14, 53],[15, 54],[16, 49],[17, 48],[19, 54],[20, 55],[21, 54],[22, 56],[23, 53],[24, 54],[25, 53],[26, 53],[27, 51]])

export const light_orange_active = n27
const n28 = t([[0, 95],[1, 96],[2, 97],[3, 98],[4, 99],[5, 101],[6, 102],[7, 103],[8, 104],[9, 105],[10, 11],[11, 11],[12, 96],[13, 97],[14, 98],[15, 99],[16, 95],[17, 94],[18, 105],[19, 104],[20, 105],[21, 104],[22, 11],[23, 98],[24, 99],[25, 98],[26, 98],[27, 102]])

export const light_yellow_alt1 = n28
const n29 = t([[0, 96],[1, 97],[2, 98],[3, 99],[4, 101],[5, 102],[6, 103],[7, 104],[8, 105],[9, 11],[10, 11],[11, 11],[12, 97],[13, 98],[14, 99],[15, 101],[16, 96],[17, 95],[18, 104],[19, 103],[20, 104],[21, 103],[22, 105],[23, 99],[24, 101],[25, 99],[26, 99],[27, 101]])

export const light_yellow_alt2 = n29
const n30 = t([[0, 97],[1, 98],[2, 99],[3, 101],[4, 102],[5, 103],[6, 104],[7, 105],[8, 11],[9, 212],[10, 212],[11, 212],[12, 98],[13, 99],[14, 101],[15, 102],[16, 97],[17, 96],[19, 102],[20, 103],[21, 102],[22, 104],[23, 101],[24, 102],[25, 101],[26, 101],[27, 99]])

export const light_yellow_active = n30
const n31 = t([[0, 35],[1, 36],[2, 37],[3, 38],[4, 39],[5, 41],[6, 42],[7, 43],[8, 44],[9, 45],[10, 11],[11, 11],[12, 36],[13, 37],[14, 38],[15, 39],[16, 35],[17, 34],[18, 45],[19, 44],[20, 45],[21, 44],[22, 11],[23, 38],[24, 39],[25, 38],[26, 38],[27, 42]])

export const light_green_alt1 = n31
const n32 = t([[0, 36],[1, 37],[2, 38],[3, 39],[4, 41],[5, 42],[6, 43],[7, 44],[8, 45],[9, 11],[10, 11],[11, 11],[12, 37],[13, 38],[14, 39],[15, 41],[16, 36],[17, 35],[18, 44],[19, 43],[20, 44],[21, 43],[22, 45],[23, 39],[24, 41],[25, 39],[26, 39],[27, 41]])

export const light_green_alt2 = n32
const n33 = t([[0, 37],[1, 38],[2, 39],[3, 41],[4, 42],[5, 43],[6, 44],[7, 45],[8, 11],[9, 214],[10, 214],[11, 214],[12, 38],[13, 39],[14, 41],[15, 42],[16, 37],[17, 36],[19, 42],[20, 43],[21, 42],[22, 44],[23, 41],[24, 42],[25, 41],[26, 41],[27, 39]])

export const light_green_active = n33
const n34 = t([[0, 15],[1, 16],[2, 17],[3, 18],[4, 19],[5, 21],[6, 22],[7, 23],[8, 24],[9, 25],[10, 11],[11, 11],[12, 16],[13, 17],[14, 18],[15, 19],[16, 15],[17, 14],[18, 25],[19, 24],[20, 25],[21, 24],[22, 11],[23, 18],[24, 19],[25, 18],[26, 18],[27, 22]])

export const light_blue_alt1 = n34
const n35 = t([[0, 16],[1, 17],[2, 18],[3, 19],[4, 21],[5, 22],[6, 23],[7, 24],[8, 25],[9, 11],[10, 11],[11, 11],[12, 17],[13, 18],[14, 19],[15, 21],[16, 16],[17, 15],[18, 24],[19, 23],[20, 24],[21, 23],[22, 25],[23, 19],[24, 21],[25, 19],[26, 19],[27, 21]])

export const light_blue_alt2 = n35
const n36 = t([[0, 17],[1, 18],[2, 19],[3, 21],[4, 22],[5, 23],[6, 24],[7, 25],[8, 11],[9, 216],[10, 216],[11, 216],[12, 18],[13, 19],[14, 21],[15, 22],[16, 17],[17, 16],[19, 22],[20, 23],[21, 22],[22, 24],[23, 21],[24, 22],[25, 21],[26, 21],[27, 19]])

export const light_blue_active = n36
const n37 = t([[0, 71],[1, 72],[2, 73],[3, 74],[4, 75],[5, 77],[6, 78],[7, 79],[8, 80],[9, 81],[10, 11],[11, 11],[12, 72],[13, 73],[14, 74],[15, 75],[16, 71],[17, 70],[18, 81],[19, 80],[20, 81],[21, 80],[22, 11],[23, 74],[24, 75],[25, 74],[26, 74],[27, 78]])

export const light_purple_alt1 = n37
const n38 = t([[0, 72],[1, 73],[2, 74],[3, 75],[4, 77],[5, 78],[6, 79],[7, 80],[8, 81],[9, 11],[10, 11],[11, 11],[12, 73],[13, 74],[14, 75],[15, 77],[16, 72],[17, 71],[18, 80],[19, 79],[20, 80],[21, 79],[22, 81],[23, 75],[24, 77],[25, 75],[26, 75],[27, 77]])

export const light_purple_alt2 = n38
const n39 = t([[0, 73],[1, 74],[2, 75],[3, 77],[4, 78],[5, 79],[6, 80],[7, 81],[8, 11],[9, 218],[10, 218],[11, 218],[12, 74],[13, 75],[14, 77],[15, 78],[16, 73],[17, 72],[19, 78],[20, 79],[21, 78],[22, 80],[23, 77],[24, 78],[25, 77],[26, 77],[27, 75]])

export const light_purple_active = n39
const n40 = t([[0, 59],[1, 60],[2, 61],[3, 62],[4, 63],[5, 65],[6, 66],[7, 67],[8, 68],[9, 69],[10, 11],[11, 11],[12, 60],[13, 61],[14, 62],[15, 63],[16, 59],[17, 58],[18, 69],[19, 68],[20, 69],[21, 68],[22, 11],[23, 62],[24, 63],[25, 62],[26, 62],[27, 66]])

export const light_pink_alt1 = n40
const n41 = t([[0, 60],[1, 61],[2, 62],[3, 63],[4, 65],[5, 66],[6, 67],[7, 68],[8, 69],[9, 11],[10, 11],[11, 11],[12, 61],[13, 62],[14, 63],[15, 65],[16, 60],[17, 59],[18, 68],[19, 67],[20, 68],[21, 67],[22, 69],[23, 63],[24, 65],[25, 63],[26, 63],[27, 65]])

export const light_pink_alt2 = n41
const n42 = t([[0, 61],[1, 62],[2, 63],[3, 65],[4, 66],[5, 67],[6, 68],[7, 69],[8, 11],[9, 220],[10, 220],[11, 220],[12, 62],[13, 63],[14, 65],[15, 66],[16, 61],[17, 60],[19, 66],[20, 67],[21, 66],[22, 68],[23, 65],[24, 66],[25, 65],[26, 65],[27, 63]])

export const light_pink_active = n42
const n43 = t([[0, 83],[1, 84],[2, 85],[3, 86],[4, 87],[5, 89],[6, 90],[7, 91],[8, 92],[9, 93],[10, 11],[11, 11],[12, 84],[13, 85],[14, 86],[15, 87],[16, 83],[17, 82],[18, 93],[19, 92],[20, 93],[21, 92],[22, 11],[23, 86],[24, 87],[25, 86],[26, 86],[27, 90]])

export const light_red_alt1 = n43
export const light_accent_alt1 = n43
const n44 = t([[0, 84],[1, 85],[2, 86],[3, 87],[4, 89],[5, 90],[6, 91],[7, 92],[8, 93],[9, 11],[10, 11],[11, 11],[12, 85],[13, 86],[14, 87],[15, 89],[16, 84],[17, 83],[18, 92],[19, 91],[20, 92],[21, 91],[22, 93],[23, 87],[24, 89],[25, 87],[26, 87],[27, 89]])

export const light_red_alt2 = n44
export const light_accent_alt2 = n44
const n45 = t([[0, 85],[1, 86],[2, 87],[3, 89],[4, 90],[5, 91],[6, 92],[7, 93],[8, 11],[9, 222],[10, 222],[11, 222],[12, 86],[13, 87],[14, 89],[15, 90],[16, 85],[17, 84],[19, 90],[20, 91],[21, 90],[22, 92],[23, 89],[24, 90],[25, 89],[26, 89],[27, 87]])

export const light_red_active = n45
export const light_accent_active = n45
const n46 = t([[0, 153],[1, 154],[2, 155],[3, 156],[4, 157],[5, 159],[6, 54],[7, 160],[8, 161],[9, 162],[10, 0],[11, 0],[12, 154],[13, 155],[14, 156],[15, 157],[16, 153],[17, 152],[18, 162],[19, 161],[20, 162],[21, 161],[22, 0],[23, 157],[24, 159],[25, 156],[26, 157],[27, 54]])

export const dark_orange_alt1 = n46
const n47 = t([[0, 154],[1, 155],[2, 156],[3, 157],[4, 159],[5, 54],[6, 160],[7, 161],[8, 162],[9, 0],[10, 0],[11, 0],[12, 155],[13, 156],[14, 157],[15, 159],[16, 154],[17, 153],[18, 161],[19, 160],[20, 161],[21, 160],[22, 162],[23, 159],[24, 54],[25, 157],[26, 159],[27, 159]])

export const dark_orange_alt2 = n47
const n48 = t([[0, 155],[1, 156],[2, 157],[3, 159],[4, 54],[5, 160],[6, 161],[7, 162],[8, 0],[9, 224],[10, 224],[11, 224],[12, 156],[13, 157],[14, 159],[15, 54],[16, 155],[17, 154],[19, 54],[20, 160],[21, 54],[22, 161],[23, 54],[24, 160],[25, 159],[26, 54],[27, 157]])

export const dark_orange_active = n48
const n49 = t([[0, 197],[1, 198],[2, 199],[3, 200],[4, 201],[5, 203],[6, 102],[7, 204],[8, 205],[9, 206],[10, 0],[11, 0],[12, 198],[13, 199],[14, 200],[15, 201],[16, 197],[17, 196],[18, 206],[19, 205],[20, 206],[21, 205],[22, 0],[23, 201],[24, 203],[25, 200],[26, 201],[27, 102]])

export const dark_yellow_alt1 = n49
const n50 = t([[0, 198],[1, 199],[2, 200],[3, 201],[4, 203],[5, 102],[6, 204],[7, 205],[8, 206],[9, 0],[10, 0],[11, 0],[12, 199],[13, 200],[14, 201],[15, 203],[16, 198],[17, 197],[18, 205],[19, 204],[20, 205],[21, 204],[22, 206],[23, 203],[24, 102],[25, 201],[26, 203],[27, 203]])

export const dark_yellow_alt2 = n50
const n51 = t([[0, 199],[1, 200],[2, 201],[3, 203],[4, 102],[5, 204],[6, 205],[7, 206],[8, 0],[9, 226],[10, 226],[11, 226],[12, 200],[13, 201],[14, 203],[15, 102],[16, 199],[17, 198],[19, 102],[20, 204],[21, 102],[22, 205],[23, 102],[24, 204],[25, 203],[26, 102],[27, 201]])

export const dark_yellow_active = n51
const n52 = t([[0, 142],[1, 143],[2, 144],[3, 145],[4, 146],[5, 148],[6, 42],[7, 149],[8, 150],[9, 151],[10, 0],[11, 0],[12, 143],[13, 144],[14, 145],[15, 146],[16, 142],[17, 141],[18, 151],[19, 150],[20, 151],[21, 150],[22, 0],[23, 146],[24, 148],[25, 145],[26, 146],[27, 42]])

export const dark_green_alt1 = n52
const n53 = t([[0, 143],[1, 144],[2, 145],[3, 146],[4, 148],[5, 42],[6, 149],[7, 150],[8, 151],[9, 0],[10, 0],[11, 0],[12, 144],[13, 145],[14, 146],[15, 148],[16, 143],[17, 142],[18, 150],[19, 149],[20, 150],[21, 149],[22, 151],[23, 148],[24, 42],[25, 146],[26, 148],[27, 148]])

export const dark_green_alt2 = n53
const n54 = t([[0, 144],[1, 145],[2, 146],[3, 148],[4, 42],[5, 149],[6, 150],[7, 151],[8, 0],[9, 228],[10, 228],[11, 228],[12, 145],[13, 146],[14, 148],[15, 42],[16, 144],[17, 143],[19, 42],[20, 149],[21, 42],[22, 150],[23, 42],[24, 149],[25, 148],[26, 42],[27, 146]])

export const dark_green_active = n54
const n55 = t([[0, 120],[1, 121],[2, 122],[3, 123],[4, 124],[5, 126],[6, 22],[7, 127],[8, 128],[9, 129],[10, 0],[11, 0],[12, 121],[13, 122],[14, 123],[15, 124],[16, 120],[17, 119],[18, 129],[19, 128],[20, 129],[21, 128],[22, 0],[23, 124],[24, 126],[25, 123],[26, 124],[27, 22]])

export const dark_blue_alt1 = n55
const n56 = t([[0, 121],[1, 122],[2, 123],[3, 124],[4, 126],[5, 22],[6, 127],[7, 128],[8, 129],[9, 0],[10, 0],[11, 0],[12, 122],[13, 123],[14, 124],[15, 126],[16, 121],[17, 120],[18, 128],[19, 127],[20, 128],[21, 127],[22, 129],[23, 126],[24, 22],[25, 124],[26, 126],[27, 126]])

export const dark_blue_alt2 = n56
const n57 = t([[0, 122],[1, 123],[2, 124],[3, 126],[4, 22],[5, 127],[6, 128],[7, 129],[8, 0],[9, 230],[10, 230],[11, 230],[12, 123],[13, 124],[14, 126],[15, 22],[16, 122],[17, 121],[19, 22],[20, 127],[21, 22],[22, 128],[23, 22],[24, 127],[25, 126],[26, 22],[27, 124]])

export const dark_blue_active = n57
const n58 = t([[0, 175],[1, 176],[2, 177],[3, 178],[4, 179],[5, 181],[6, 78],[7, 182],[8, 183],[9, 184],[10, 0],[11, 0],[12, 176],[13, 177],[14, 178],[15, 179],[16, 175],[17, 174],[18, 184],[19, 183],[20, 184],[21, 183],[22, 0],[23, 179],[24, 181],[25, 178],[26, 179],[27, 78]])

export const dark_purple_alt1 = n58
const n59 = t([[0, 176],[1, 177],[2, 178],[3, 179],[4, 181],[5, 78],[6, 182],[7, 183],[8, 184],[9, 0],[10, 0],[11, 0],[12, 177],[13, 178],[14, 179],[15, 181],[16, 176],[17, 175],[18, 183],[19, 182],[20, 183],[21, 182],[22, 184],[23, 181],[24, 78],[25, 179],[26, 181],[27, 181]])

export const dark_purple_alt2 = n59
const n60 = t([[0, 177],[1, 178],[2, 179],[3, 181],[4, 78],[5, 182],[6, 183],[7, 184],[8, 0],[9, 232],[10, 232],[11, 232],[12, 178],[13, 179],[14, 181],[15, 78],[16, 177],[17, 176],[19, 78],[20, 182],[21, 78],[22, 183],[23, 78],[24, 182],[25, 181],[26, 78],[27, 179]])

export const dark_purple_active = n60
const n61 = t([[0, 164],[1, 165],[2, 166],[3, 167],[4, 168],[5, 170],[6, 66],[7, 171],[8, 172],[9, 173],[10, 0],[11, 0],[12, 165],[13, 166],[14, 167],[15, 168],[16, 164],[17, 163],[18, 173],[19, 172],[20, 173],[21, 172],[22, 0],[23, 168],[24, 170],[25, 167],[26, 168],[27, 66]])

export const dark_pink_alt1 = n61
const n62 = t([[0, 165],[1, 166],[2, 167],[3, 168],[4, 170],[5, 66],[6, 171],[7, 172],[8, 173],[9, 0],[10, 0],[11, 0],[12, 166],[13, 167],[14, 168],[15, 170],[16, 165],[17, 164],[18, 172],[19, 171],[20, 172],[21, 171],[22, 173],[23, 170],[24, 66],[25, 168],[26, 170],[27, 170]])

export const dark_pink_alt2 = n62
const n63 = t([[0, 166],[1, 167],[2, 168],[3, 170],[4, 66],[5, 171],[6, 172],[7, 173],[8, 0],[9, 234],[10, 234],[11, 234],[12, 167],[13, 168],[14, 170],[15, 66],[16, 166],[17, 165],[19, 66],[20, 171],[21, 66],[22, 172],[23, 66],[24, 171],[25, 170],[26, 66],[27, 168]])

export const dark_pink_active = n63
const n64 = t([[0, 186],[1, 187],[2, 188],[3, 189],[4, 190],[5, 192],[6, 90],[7, 193],[8, 194],[9, 195],[10, 0],[11, 0],[12, 187],[13, 188],[14, 189],[15, 190],[16, 186],[17, 185],[18, 195],[19, 194],[20, 195],[21, 194],[22, 0],[23, 190],[24, 192],[25, 189],[26, 190],[27, 90]])

export const dark_red_alt1 = n64
export const dark_accent_alt1 = n64
const n65 = t([[0, 187],[1, 188],[2, 189],[3, 190],[4, 192],[5, 90],[6, 193],[7, 194],[8, 195],[9, 0],[10, 0],[11, 0],[12, 188],[13, 189],[14, 190],[15, 192],[16, 187],[17, 186],[18, 194],[19, 193],[20, 194],[21, 193],[22, 195],[23, 192],[24, 90],[25, 190],[26, 192],[27, 192]])

export const dark_red_alt2 = n65
export const dark_accent_alt2 = n65
const n66 = t([[0, 188],[1, 189],[2, 190],[3, 192],[4, 90],[5, 193],[6, 194],[7, 195],[8, 0],[9, 236],[10, 236],[11, 236],[12, 189],[13, 190],[14, 192],[15, 90],[16, 188],[17, 187],[19, 90],[20, 193],[21, 90],[22, 194],[23, 90],[24, 193],[25, 192],[26, 90],[27, 190]])

export const dark_red_active = n66
export const dark_accent_active = n66
const n67 = t([[12, 0],[13, 1],[14, 2],[15, 3],[16, 0],[17, 0],[18, 11],[19, 10],[20, 11],[21, 10],[22, 11],[23, 3],[24, 4],[25, 2],[26, 3],[27, 9]])

export const light_ListItem = n67
const n68 = t([[12, 2],[13, 3],[14, 4],[15, 5],[16, 1],[17, 0],[18, 11],[19, 10],[20, 11],[21, 10],[22, 11],[23, 5],[24, 6],[25, 4],[26, 5],[27, 7]])

export const light_Card = n68
export const light_DrawerFrame = n68
export const light_Progress = n68
export const light_TooltipArrow = n68
const n69 = t([[12, 3],[13, 4],[14, 5],[15, 6],[16, 2],[17, 1],[18, 11],[19, 10],[20, 11],[21, 10],[22, 10],[23, 239],[24, 239],[25, 5],[26, 6],[27, 6]])

export const light_Button = n69
const n70 = t([[12, 3],[13, 4],[14, 5],[15, 6],[16, 2],[17, 1],[18, 11],[19, 10],[20, 11],[21, 10],[22, 10],[23, 6],[24, 7],[25, 5],[26, 6],[27, 6]])

export const light_Checkbox = n70
export const light_Switch = n70
export const light_TooltipContent = n70
export const light_SliderTrack = n70
const n71 = t([[12, 11],[13, 11],[14, 10],[15, 9],[16, 11],[17, 11],[18, 0],[19, 1],[20, 0],[21, 1],[22, 0],[23, 9],[24, 8],[25, 10],[26, 9],[27, 1]])

export const light_SwitchThumb = n71
const n72 = t([[12, 8],[13, 7],[14, 6],[15, 5],[16, 9],[17, 10],[18, 0],[19, 1],[20, 0],[21, 1],[22, 1],[23, 5],[24, 4],[25, 6],[26, 5],[27, 5]])

export const light_SliderTrackActive = n72
const n73 = t([[12, 10],[13, 9],[14, 8],[15, 7],[16, 11],[17, 13],[18, 0],[19, 1],[20, 0],[21, 1],[22, 12],[23, 7],[24, 6],[25, 8],[26, 7],[27, 3]])

export const light_SliderThumb = n73
export const light_Tooltip = n73
export const light_ProgressIndicator = n73
const n74 = t([[12, 0],[13, 1],[14, 2],[15, 3],[16, 0],[17, 0],[18, 11],[19, 10],[20, 11],[21, 10],[22, 11],[23, 5],[24, 6],[25, 4],[26, 5],[27, 9]])

export const light_Input = n74
export const light_TextArea = n74
const n75 = t([[12, 109],[13, 110],[14, 111],[15, 112],[16, 108],[17, 13],[18, 0],[19, 118],[20, 0],[21, 118],[22, 12],[23, 112],[24, 113],[25, 111],[26, 112],[27, 116]])

export const dark_ListItem = n75
const n76 = t([[12, 110],[13, 111],[14, 112],[15, 113],[16, 109],[17, 108],[18, 0],[19, 118],[20, 0],[21, 118],[22, 0],[23, 113],[24, 114],[25, 112],[26, 113],[27, 115]])

export const dark_Card = n76
export const dark_DrawerFrame = n76
export const dark_Progress = n76
export const dark_TooltipArrow = n76
const n77 = t([[12, 111],[13, 112],[14, 113],[15, 114],[16, 110],[17, 109],[18, 0],[19, 118],[20, 0],[21, 118],[22, 118],[23, 239],[24, 239],[25, 113],[26, 114],[27, 114]])

export const dark_Button = n77
const n78 = t([[12, 111],[13, 112],[14, 113],[15, 114],[16, 110],[17, 109],[18, 0],[19, 118],[20, 0],[21, 118],[22, 118],[23, 114],[24, 115],[25, 113],[26, 114],[27, 114]])

export const dark_Checkbox = n78
export const dark_Switch = n78
export const dark_TooltipContent = n78
export const dark_SliderTrack = n78
const n79 = t([[12, 0],[13, 0],[14, 118],[15, 117],[16, 0],[17, 0],[18, 108],[19, 109],[20, 108],[21, 109],[22, 108],[23, 117],[24, 116],[25, 118],[26, 117],[27, 109]])

export const dark_SwitchThumb = n79
const n80 = t([[12, 116],[13, 115],[14, 114],[15, 113],[16, 117],[17, 118],[18, 108],[19, 109],[20, 108],[21, 109],[22, 109],[23, 113],[24, 112],[25, 114],[26, 113],[27, 113]])

export const dark_SliderTrackActive = n80
const n81 = t([[12, 118],[13, 117],[14, 116],[15, 115],[16, 0],[17, 12],[18, 108],[19, 109],[20, 108],[21, 109],[22, 13],[23, 115],[24, 114],[25, 116],[26, 115],[27, 111]])

export const dark_SliderThumb = n81
export const dark_Tooltip = n81
export const dark_ProgressIndicator = n81
const n82 = t([[12, 109],[13, 110],[14, 111],[15, 112],[16, 108],[17, 13],[18, 0],[19, 118],[20, 0],[21, 118],[22, 12],[23, 113],[24, 114],[25, 112],[26, 113],[27, 116]])

export const dark_Input = n82
export const dark_TextArea = n82
const n83 = t([[12, 46],[13, 47],[14, 48],[15, 49],[16, 46],[17, 46],[18, 11],[19, 57],[20, 11],[21, 57],[22, 11],[23, 48],[24, 49],[25, 48],[26, 48],[27, 56]])

export const light_orange_ListItem = n83
const n84 = t([[12, 48],[13, 49],[14, 50],[15, 51],[16, 47],[17, 46],[18, 11],[19, 57],[20, 11],[21, 57],[22, 11],[23, 50],[24, 51],[25, 50],[26, 50],[27, 54]])

export const light_orange_Card = n84
export const light_orange_DrawerFrame = n84
export const light_orange_Progress = n84
export const light_orange_TooltipArrow = n84
const n85 = t([[12, 49],[13, 50],[14, 51],[15, 53],[16, 48],[17, 47],[18, 11],[19, 57],[20, 11],[21, 57],[22, 57],[23, 239],[24, 239],[25, 51],[26, 51],[27, 53]])

export const light_orange_Button = n85
const n86 = t([[12, 49],[13, 50],[14, 51],[15, 53],[16, 48],[17, 47],[18, 11],[19, 57],[20, 11],[21, 57],[22, 57],[23, 51],[24, 53],[25, 51],[26, 51],[27, 53]])

export const light_orange_Checkbox = n86
export const light_orange_Switch = n86
export const light_orange_TooltipContent = n86
export const light_orange_SliderTrack = n86
const n87 = t([[12, 11],[13, 11],[14, 57],[15, 56],[16, 11],[17, 11],[18, 46],[19, 47],[20, 46],[21, 47],[22, 46],[23, 57],[24, 56],[25, 57],[26, 57],[27, 47]])

export const light_orange_SwitchThumb = n87
const n88 = t([[12, 55],[13, 54],[14, 53],[15, 51],[16, 56],[17, 57],[18, 46],[19, 47],[20, 46],[21, 47],[22, 47],[23, 53],[24, 51],[25, 53],[26, 53],[27, 51]])

export const light_orange_SliderTrackActive = n88
const n89 = t([[12, 57],[13, 56],[14, 55],[15, 54],[16, 11],[17, 210],[18, 46],[19, 47],[20, 46],[21, 47],[22, 209],[23, 55],[24, 54],[25, 55],[26, 55],[27, 49]])

export const light_orange_SliderThumb = n89
export const light_orange_Tooltip = n89
export const light_orange_ProgressIndicator = n89
const n90 = t([[12, 46],[13, 47],[14, 48],[15, 49],[16, 46],[17, 46],[18, 11],[19, 57],[20, 11],[21, 57],[22, 11],[23, 50],[24, 51],[25, 50],[26, 50],[27, 56]])

export const light_orange_Input = n90
export const light_orange_TextArea = n90
const n91 = t([[12, 94],[13, 95],[14, 96],[15, 97],[16, 94],[17, 94],[18, 11],[19, 105],[20, 11],[21, 105],[22, 11],[23, 96],[24, 97],[25, 96],[26, 96],[27, 104]])

export const light_yellow_ListItem = n91
const n92 = t([[12, 96],[13, 97],[14, 98],[15, 99],[16, 95],[17, 94],[18, 11],[19, 105],[20, 11],[21, 105],[22, 11],[23, 98],[24, 99],[25, 98],[26, 98],[27, 102]])

export const light_yellow_Card = n92
export const light_yellow_DrawerFrame = n92
export const light_yellow_Progress = n92
export const light_yellow_TooltipArrow = n92
const n93 = t([[12, 97],[13, 98],[14, 99],[15, 101],[16, 96],[17, 95],[18, 11],[19, 105],[20, 11],[21, 105],[22, 105],[23, 239],[24, 239],[25, 99],[26, 99],[27, 101]])

export const light_yellow_Button = n93
const n94 = t([[12, 97],[13, 98],[14, 99],[15, 101],[16, 96],[17, 95],[18, 11],[19, 105],[20, 11],[21, 105],[22, 105],[23, 99],[24, 101],[25, 99],[26, 99],[27, 101]])

export const light_yellow_Checkbox = n94
export const light_yellow_Switch = n94
export const light_yellow_TooltipContent = n94
export const light_yellow_SliderTrack = n94
const n95 = t([[12, 11],[13, 11],[14, 105],[15, 104],[16, 11],[17, 11],[18, 94],[19, 95],[20, 94],[21, 95],[22, 94],[23, 105],[24, 104],[25, 105],[26, 105],[27, 95]])

export const light_yellow_SwitchThumb = n95
const n96 = t([[12, 103],[13, 102],[14, 101],[15, 99],[16, 104],[17, 105],[18, 94],[19, 95],[20, 94],[21, 95],[22, 95],[23, 101],[24, 99],[25, 101],[26, 101],[27, 99]])

export const light_yellow_SliderTrackActive = n96
const n97 = t([[12, 105],[13, 104],[14, 103],[15, 102],[16, 11],[17, 212],[18, 94],[19, 95],[20, 94],[21, 95],[22, 211],[23, 103],[24, 102],[25, 103],[26, 103],[27, 97]])

export const light_yellow_SliderThumb = n97
export const light_yellow_Tooltip = n97
export const light_yellow_ProgressIndicator = n97
const n98 = t([[12, 94],[13, 95],[14, 96],[15, 97],[16, 94],[17, 94],[18, 11],[19, 105],[20, 11],[21, 105],[22, 11],[23, 98],[24, 99],[25, 98],[26, 98],[27, 104]])

export const light_yellow_Input = n98
export const light_yellow_TextArea = n98
const n99 = t([[12, 34],[13, 35],[14, 36],[15, 37],[16, 34],[17, 34],[18, 11],[19, 45],[20, 11],[21, 45],[22, 11],[23, 36],[24, 37],[25, 36],[26, 36],[27, 44]])

export const light_green_ListItem = n99
const n100 = t([[12, 36],[13, 37],[14, 38],[15, 39],[16, 35],[17, 34],[18, 11],[19, 45],[20, 11],[21, 45],[22, 11],[23, 38],[24, 39],[25, 38],[26, 38],[27, 42]])

export const light_green_Card = n100
export const light_green_DrawerFrame = n100
export const light_green_Progress = n100
export const light_green_TooltipArrow = n100
const n101 = t([[12, 37],[13, 38],[14, 39],[15, 41],[16, 36],[17, 35],[18, 11],[19, 45],[20, 11],[21, 45],[22, 45],[23, 239],[24, 239],[25, 39],[26, 39],[27, 41]])

export const light_green_Button = n101
const n102 = t([[12, 37],[13, 38],[14, 39],[15, 41],[16, 36],[17, 35],[18, 11],[19, 45],[20, 11],[21, 45],[22, 45],[23, 39],[24, 41],[25, 39],[26, 39],[27, 41]])

export const light_green_Checkbox = n102
export const light_green_Switch = n102
export const light_green_TooltipContent = n102
export const light_green_SliderTrack = n102
const n103 = t([[12, 11],[13, 11],[14, 45],[15, 44],[16, 11],[17, 11],[18, 34],[19, 35],[20, 34],[21, 35],[22, 34],[23, 45],[24, 44],[25, 45],[26, 45],[27, 35]])

export const light_green_SwitchThumb = n103
const n104 = t([[12, 43],[13, 42],[14, 41],[15, 39],[16, 44],[17, 45],[18, 34],[19, 35],[20, 34],[21, 35],[22, 35],[23, 41],[24, 39],[25, 41],[26, 41],[27, 39]])

export const light_green_SliderTrackActive = n104
const n105 = t([[12, 45],[13, 44],[14, 43],[15, 42],[16, 11],[17, 214],[18, 34],[19, 35],[20, 34],[21, 35],[22, 213],[23, 43],[24, 42],[25, 43],[26, 43],[27, 37]])

export const light_green_SliderThumb = n105
export const light_green_Tooltip = n105
export const light_green_ProgressIndicator = n105
const n106 = t([[12, 34],[13, 35],[14, 36],[15, 37],[16, 34],[17, 34],[18, 11],[19, 45],[20, 11],[21, 45],[22, 11],[23, 38],[24, 39],[25, 38],[26, 38],[27, 44]])

export const light_green_Input = n106
export const light_green_TextArea = n106
const n107 = t([[12, 14],[13, 15],[14, 16],[15, 17],[16, 14],[17, 14],[18, 11],[19, 25],[20, 11],[21, 25],[22, 11],[23, 16],[24, 17],[25, 16],[26, 16],[27, 24]])

export const light_blue_ListItem = n107
const n108 = t([[12, 16],[13, 17],[14, 18],[15, 19],[16, 15],[17, 14],[18, 11],[19, 25],[20, 11],[21, 25],[22, 11],[23, 18],[24, 19],[25, 18],[26, 18],[27, 22]])

export const light_blue_Card = n108
export const light_blue_DrawerFrame = n108
export const light_blue_Progress = n108
export const light_blue_TooltipArrow = n108
const n109 = t([[12, 17],[13, 18],[14, 19],[15, 21],[16, 16],[17, 15],[18, 11],[19, 25],[20, 11],[21, 25],[22, 25],[23, 239],[24, 239],[25, 19],[26, 19],[27, 21]])

export const light_blue_Button = n109
const n110 = t([[12, 17],[13, 18],[14, 19],[15, 21],[16, 16],[17, 15],[18, 11],[19, 25],[20, 11],[21, 25],[22, 25],[23, 19],[24, 21],[25, 19],[26, 19],[27, 21]])

export const light_blue_Checkbox = n110
export const light_blue_Switch = n110
export const light_blue_TooltipContent = n110
export const light_blue_SliderTrack = n110
const n111 = t([[12, 11],[13, 11],[14, 25],[15, 24],[16, 11],[17, 11],[18, 14],[19, 15],[20, 14],[21, 15],[22, 14],[23, 25],[24, 24],[25, 25],[26, 25],[27, 15]])

export const light_blue_SwitchThumb = n111
const n112 = t([[12, 23],[13, 22],[14, 21],[15, 19],[16, 24],[17, 25],[18, 14],[19, 15],[20, 14],[21, 15],[22, 15],[23, 21],[24, 19],[25, 21],[26, 21],[27, 19]])

export const light_blue_SliderTrackActive = n112
const n113 = t([[12, 25],[13, 24],[14, 23],[15, 22],[16, 11],[17, 216],[18, 14],[19, 15],[20, 14],[21, 15],[22, 215],[23, 23],[24, 22],[25, 23],[26, 23],[27, 17]])

export const light_blue_SliderThumb = n113
export const light_blue_Tooltip = n113
export const light_blue_ProgressIndicator = n113
const n114 = t([[12, 14],[13, 15],[14, 16],[15, 17],[16, 14],[17, 14],[18, 11],[19, 25],[20, 11],[21, 25],[22, 11],[23, 18],[24, 19],[25, 18],[26, 18],[27, 24]])

export const light_blue_Input = n114
export const light_blue_TextArea = n114
const n115 = t([[12, 70],[13, 71],[14, 72],[15, 73],[16, 70],[17, 70],[18, 11],[19, 81],[20, 11],[21, 81],[22, 11],[23, 72],[24, 73],[25, 72],[26, 72],[27, 80]])

export const light_purple_ListItem = n115
const n116 = t([[12, 72],[13, 73],[14, 74],[15, 75],[16, 71],[17, 70],[18, 11],[19, 81],[20, 11],[21, 81],[22, 11],[23, 74],[24, 75],[25, 74],[26, 74],[27, 78]])

export const light_purple_Card = n116
export const light_purple_DrawerFrame = n116
export const light_purple_Progress = n116
export const light_purple_TooltipArrow = n116
const n117 = t([[12, 73],[13, 74],[14, 75],[15, 77],[16, 72],[17, 71],[18, 11],[19, 81],[20, 11],[21, 81],[22, 81],[23, 239],[24, 239],[25, 75],[26, 75],[27, 77]])

export const light_purple_Button = n117
const n118 = t([[12, 73],[13, 74],[14, 75],[15, 77],[16, 72],[17, 71],[18, 11],[19, 81],[20, 11],[21, 81],[22, 81],[23, 75],[24, 77],[25, 75],[26, 75],[27, 77]])

export const light_purple_Checkbox = n118
export const light_purple_Switch = n118
export const light_purple_TooltipContent = n118
export const light_purple_SliderTrack = n118
const n119 = t([[12, 11],[13, 11],[14, 81],[15, 80],[16, 11],[17, 11],[18, 70],[19, 71],[20, 70],[21, 71],[22, 70],[23, 81],[24, 80],[25, 81],[26, 81],[27, 71]])

export const light_purple_SwitchThumb = n119
const n120 = t([[12, 79],[13, 78],[14, 77],[15, 75],[16, 80],[17, 81],[18, 70],[19, 71],[20, 70],[21, 71],[22, 71],[23, 77],[24, 75],[25, 77],[26, 77],[27, 75]])

export const light_purple_SliderTrackActive = n120
const n121 = t([[12, 81],[13, 80],[14, 79],[15, 78],[16, 11],[17, 218],[18, 70],[19, 71],[20, 70],[21, 71],[22, 217],[23, 79],[24, 78],[25, 79],[26, 79],[27, 73]])

export const light_purple_SliderThumb = n121
export const light_purple_Tooltip = n121
export const light_purple_ProgressIndicator = n121
const n122 = t([[12, 70],[13, 71],[14, 72],[15, 73],[16, 70],[17, 70],[18, 11],[19, 81],[20, 11],[21, 81],[22, 11],[23, 74],[24, 75],[25, 74],[26, 74],[27, 80]])

export const light_purple_Input = n122
export const light_purple_TextArea = n122
const n123 = t([[12, 58],[13, 59],[14, 60],[15, 61],[16, 58],[17, 58],[18, 11],[19, 69],[20, 11],[21, 69],[22, 11],[23, 60],[24, 61],[25, 60],[26, 60],[27, 68]])

export const light_pink_ListItem = n123
const n124 = t([[12, 60],[13, 61],[14, 62],[15, 63],[16, 59],[17, 58],[18, 11],[19, 69],[20, 11],[21, 69],[22, 11],[23, 62],[24, 63],[25, 62],[26, 62],[27, 66]])

export const light_pink_Card = n124
export const light_pink_DrawerFrame = n124
export const light_pink_Progress = n124
export const light_pink_TooltipArrow = n124
const n125 = t([[12, 61],[13, 62],[14, 63],[15, 65],[16, 60],[17, 59],[18, 11],[19, 69],[20, 11],[21, 69],[22, 69],[23, 239],[24, 239],[25, 63],[26, 63],[27, 65]])

export const light_pink_Button = n125
const n126 = t([[12, 61],[13, 62],[14, 63],[15, 65],[16, 60],[17, 59],[18, 11],[19, 69],[20, 11],[21, 69],[22, 69],[23, 63],[24, 65],[25, 63],[26, 63],[27, 65]])

export const light_pink_Checkbox = n126
export const light_pink_Switch = n126
export const light_pink_TooltipContent = n126
export const light_pink_SliderTrack = n126
const n127 = t([[12, 11],[13, 11],[14, 69],[15, 68],[16, 11],[17, 11],[18, 58],[19, 59],[20, 58],[21, 59],[22, 58],[23, 69],[24, 68],[25, 69],[26, 69],[27, 59]])

export const light_pink_SwitchThumb = n127
const n128 = t([[12, 67],[13, 66],[14, 65],[15, 63],[16, 68],[17, 69],[18, 58],[19, 59],[20, 58],[21, 59],[22, 59],[23, 65],[24, 63],[25, 65],[26, 65],[27, 63]])

export const light_pink_SliderTrackActive = n128
const n129 = t([[12, 69],[13, 68],[14, 67],[15, 66],[16, 11],[17, 220],[18, 58],[19, 59],[20, 58],[21, 59],[22, 219],[23, 67],[24, 66],[25, 67],[26, 67],[27, 61]])

export const light_pink_SliderThumb = n129
export const light_pink_Tooltip = n129
export const light_pink_ProgressIndicator = n129
const n130 = t([[12, 58],[13, 59],[14, 60],[15, 61],[16, 58],[17, 58],[18, 11],[19, 69],[20, 11],[21, 69],[22, 11],[23, 62],[24, 63],[25, 62],[26, 62],[27, 68]])

export const light_pink_Input = n130
export const light_pink_TextArea = n130
const n131 = t([[12, 82],[13, 83],[14, 84],[15, 85],[16, 82],[17, 82],[18, 11],[19, 93],[20, 11],[21, 93],[22, 11],[23, 84],[24, 85],[25, 84],[26, 84],[27, 92]])

export const light_red_ListItem = n131
export const light_accent_ListItem = n131
const n132 = t([[12, 84],[13, 85],[14, 86],[15, 87],[16, 83],[17, 82],[18, 11],[19, 93],[20, 11],[21, 93],[22, 11],[23, 86],[24, 87],[25, 86],[26, 86],[27, 90]])

export const light_red_Card = n132
export const light_red_DrawerFrame = n132
export const light_red_Progress = n132
export const light_red_TooltipArrow = n132
export const light_accent_Card = n132
export const light_accent_DrawerFrame = n132
export const light_accent_Progress = n132
export const light_accent_TooltipArrow = n132
const n133 = t([[12, 85],[13, 86],[14, 87],[15, 89],[16, 84],[17, 83],[18, 11],[19, 93],[20, 11],[21, 93],[22, 93],[23, 239],[24, 239],[25, 87],[26, 87],[27, 89]])

export const light_red_Button = n133
export const light_accent_Button = n133
const n134 = t([[12, 85],[13, 86],[14, 87],[15, 89],[16, 84],[17, 83],[18, 11],[19, 93],[20, 11],[21, 93],[22, 93],[23, 87],[24, 89],[25, 87],[26, 87],[27, 89]])

export const light_red_Checkbox = n134
export const light_red_Switch = n134
export const light_red_TooltipContent = n134
export const light_red_SliderTrack = n134
export const light_accent_Checkbox = n134
export const light_accent_Switch = n134
export const light_accent_TooltipContent = n134
export const light_accent_SliderTrack = n134
const n135 = t([[12, 11],[13, 11],[14, 93],[15, 92],[16, 11],[17, 11],[18, 82],[19, 83],[20, 82],[21, 83],[22, 82],[23, 93],[24, 92],[25, 93],[26, 93],[27, 83]])

export const light_red_SwitchThumb = n135
export const light_accent_SwitchThumb = n135
const n136 = t([[12, 91],[13, 90],[14, 89],[15, 87],[16, 92],[17, 93],[18, 82],[19, 83],[20, 82],[21, 83],[22, 83],[23, 89],[24, 87],[25, 89],[26, 89],[27, 87]])

export const light_red_SliderTrackActive = n136
export const light_accent_SliderTrackActive = n136
const n137 = t([[12, 93],[13, 92],[14, 91],[15, 90],[16, 11],[17, 222],[18, 82],[19, 83],[20, 82],[21, 83],[22, 221],[23, 91],[24, 90],[25, 91],[26, 91],[27, 85]])

export const light_red_SliderThumb = n137
export const light_red_Tooltip = n137
export const light_red_ProgressIndicator = n137
export const light_accent_SliderThumb = n137
export const light_accent_Tooltip = n137
export const light_accent_ProgressIndicator = n137
const n138 = t([[12, 82],[13, 83],[14, 84],[15, 85],[16, 82],[17, 82],[18, 11],[19, 93],[20, 11],[21, 93],[22, 11],[23, 86],[24, 87],[25, 86],[26, 86],[27, 92]])

export const light_red_Input = n138
export const light_red_TextArea = n138
export const light_accent_Input = n138
export const light_accent_TextArea = n138
const n139 = t([[12, 153],[13, 154],[14, 155],[15, 156],[16, 152],[17, 223],[18, 0],[19, 162],[20, 0],[21, 162],[22, 224],[23, 156],[24, 157],[25, 155],[26, 156],[27, 160]])

export const dark_orange_ListItem = n139
const n140 = t([[12, 154],[13, 155],[14, 156],[15, 157],[16, 153],[17, 152],[18, 0],[19, 162],[20, 0],[21, 162],[22, 0],[23, 157],[24, 159],[25, 156],[26, 157],[27, 54]])

export const dark_orange_Card = n140
export const dark_orange_DrawerFrame = n140
export const dark_orange_Progress = n140
export const dark_orange_TooltipArrow = n140
const n141 = t([[12, 155],[13, 156],[14, 157],[15, 159],[16, 154],[17, 153],[18, 0],[19, 162],[20, 0],[21, 162],[22, 162],[23, 239],[24, 239],[25, 157],[26, 159],[27, 159]])

export const dark_orange_Button = n141
const n142 = t([[12, 155],[13, 156],[14, 157],[15, 159],[16, 154],[17, 153],[18, 0],[19, 162],[20, 0],[21, 162],[22, 162],[23, 159],[24, 54],[25, 157],[26, 159],[27, 159]])

export const dark_orange_Checkbox = n142
export const dark_orange_Switch = n142
export const dark_orange_TooltipContent = n142
export const dark_orange_SliderTrack = n142
const n143 = t([[12, 0],[13, 0],[14, 162],[15, 161],[16, 0],[17, 0],[18, 152],[19, 153],[20, 152],[21, 153],[22, 152],[23, 161],[24, 160],[25, 162],[26, 161],[27, 153]])

export const dark_orange_SwitchThumb = n143
const n144 = t([[12, 160],[13, 54],[14, 159],[15, 157],[16, 161],[17, 162],[18, 152],[19, 153],[20, 152],[21, 153],[22, 153],[23, 157],[24, 156],[25, 159],[26, 157],[27, 157]])

export const dark_orange_SliderTrackActive = n144
const n145 = t([[12, 162],[13, 161],[14, 160],[15, 54],[16, 0],[17, 224],[18, 152],[19, 153],[20, 152],[21, 153],[22, 223],[23, 54],[24, 159],[25, 160],[26, 54],[27, 155]])

export const dark_orange_SliderThumb = n145
export const dark_orange_Tooltip = n145
export const dark_orange_ProgressIndicator = n145
const n146 = t([[12, 153],[13, 154],[14, 155],[15, 156],[16, 152],[17, 223],[18, 0],[19, 162],[20, 0],[21, 162],[22, 224],[23, 157],[24, 159],[25, 156],[26, 157],[27, 160]])

export const dark_orange_Input = n146
export const dark_orange_TextArea = n146
const n147 = t([[12, 197],[13, 198],[14, 199],[15, 200],[16, 196],[17, 225],[18, 0],[19, 206],[20, 0],[21, 206],[22, 226],[23, 200],[24, 201],[25, 199],[26, 200],[27, 204]])

export const dark_yellow_ListItem = n147
const n148 = t([[12, 198],[13, 199],[14, 200],[15, 201],[16, 197],[17, 196],[18, 0],[19, 206],[20, 0],[21, 206],[22, 0],[23, 201],[24, 203],[25, 200],[26, 201],[27, 102]])

export const dark_yellow_Card = n148
export const dark_yellow_DrawerFrame = n148
export const dark_yellow_Progress = n148
export const dark_yellow_TooltipArrow = n148
const n149 = t([[12, 199],[13, 200],[14, 201],[15, 203],[16, 198],[17, 197],[18, 0],[19, 206],[20, 0],[21, 206],[22, 206],[23, 239],[24, 239],[25, 201],[26, 203],[27, 203]])

export const dark_yellow_Button = n149
const n150 = t([[12, 199],[13, 200],[14, 201],[15, 203],[16, 198],[17, 197],[18, 0],[19, 206],[20, 0],[21, 206],[22, 206],[23, 203],[24, 102],[25, 201],[26, 203],[27, 203]])

export const dark_yellow_Checkbox = n150
export const dark_yellow_Switch = n150
export const dark_yellow_TooltipContent = n150
export const dark_yellow_SliderTrack = n150
const n151 = t([[12, 0],[13, 0],[14, 206],[15, 205],[16, 0],[17, 0],[18, 196],[19, 197],[20, 196],[21, 197],[22, 196],[23, 205],[24, 204],[25, 206],[26, 205],[27, 197]])

export const dark_yellow_SwitchThumb = n151
const n152 = t([[12, 204],[13, 102],[14, 203],[15, 201],[16, 205],[17, 206],[18, 196],[19, 197],[20, 196],[21, 197],[22, 197],[23, 201],[24, 200],[25, 203],[26, 201],[27, 201]])

export const dark_yellow_SliderTrackActive = n152
const n153 = t([[12, 206],[13, 205],[14, 204],[15, 102],[16, 0],[17, 226],[18, 196],[19, 197],[20, 196],[21, 197],[22, 225],[23, 102],[24, 203],[25, 204],[26, 102],[27, 199]])

export const dark_yellow_SliderThumb = n153
export const dark_yellow_Tooltip = n153
export const dark_yellow_ProgressIndicator = n153
const n154 = t([[12, 197],[13, 198],[14, 199],[15, 200],[16, 196],[17, 225],[18, 0],[19, 206],[20, 0],[21, 206],[22, 226],[23, 201],[24, 203],[25, 200],[26, 201],[27, 204]])

export const dark_yellow_Input = n154
export const dark_yellow_TextArea = n154
const n155 = t([[12, 142],[13, 143],[14, 144],[15, 145],[16, 141],[17, 227],[18, 0],[19, 151],[20, 0],[21, 151],[22, 228],[23, 145],[24, 146],[25, 144],[26, 145],[27, 149]])

export const dark_green_ListItem = n155
const n156 = t([[12, 143],[13, 144],[14, 145],[15, 146],[16, 142],[17, 141],[18, 0],[19, 151],[20, 0],[21, 151],[22, 0],[23, 146],[24, 148],[25, 145],[26, 146],[27, 42]])

export const dark_green_Card = n156
export const dark_green_DrawerFrame = n156
export const dark_green_Progress = n156
export const dark_green_TooltipArrow = n156
const n157 = t([[12, 144],[13, 145],[14, 146],[15, 148],[16, 143],[17, 142],[18, 0],[19, 151],[20, 0],[21, 151],[22, 151],[23, 239],[24, 239],[25, 146],[26, 148],[27, 148]])

export const dark_green_Button = n157
const n158 = t([[12, 144],[13, 145],[14, 146],[15, 148],[16, 143],[17, 142],[18, 0],[19, 151],[20, 0],[21, 151],[22, 151],[23, 148],[24, 42],[25, 146],[26, 148],[27, 148]])

export const dark_green_Checkbox = n158
export const dark_green_Switch = n158
export const dark_green_TooltipContent = n158
export const dark_green_SliderTrack = n158
const n159 = t([[12, 0],[13, 0],[14, 151],[15, 150],[16, 0],[17, 0],[18, 141],[19, 142],[20, 141],[21, 142],[22, 141],[23, 150],[24, 149],[25, 151],[26, 150],[27, 142]])

export const dark_green_SwitchThumb = n159
const n160 = t([[12, 149],[13, 42],[14, 148],[15, 146],[16, 150],[17, 151],[18, 141],[19, 142],[20, 141],[21, 142],[22, 142],[23, 146],[24, 145],[25, 148],[26, 146],[27, 146]])

export const dark_green_SliderTrackActive = n160
const n161 = t([[12, 151],[13, 150],[14, 149],[15, 42],[16, 0],[17, 228],[18, 141],[19, 142],[20, 141],[21, 142],[22, 227],[23, 42],[24, 148],[25, 149],[26, 42],[27, 144]])

export const dark_green_SliderThumb = n161
export const dark_green_Tooltip = n161
export const dark_green_ProgressIndicator = n161
const n162 = t([[12, 142],[13, 143],[14, 144],[15, 145],[16, 141],[17, 227],[18, 0],[19, 151],[20, 0],[21, 151],[22, 228],[23, 146],[24, 148],[25, 145],[26, 146],[27, 149]])

export const dark_green_Input = n162
export const dark_green_TextArea = n162
const n163 = t([[12, 120],[13, 121],[14, 122],[15, 123],[16, 119],[17, 229],[18, 0],[19, 129],[20, 0],[21, 129],[22, 230],[23, 123],[24, 124],[25, 122],[26, 123],[27, 127]])

export const dark_blue_ListItem = n163
const n164 = t([[12, 121],[13, 122],[14, 123],[15, 124],[16, 120],[17, 119],[18, 0],[19, 129],[20, 0],[21, 129],[22, 0],[23, 124],[24, 126],[25, 123],[26, 124],[27, 22]])

export const dark_blue_Card = n164
export const dark_blue_DrawerFrame = n164
export const dark_blue_Progress = n164
export const dark_blue_TooltipArrow = n164
const n165 = t([[12, 122],[13, 123],[14, 124],[15, 126],[16, 121],[17, 120],[18, 0],[19, 129],[20, 0],[21, 129],[22, 129],[23, 239],[24, 239],[25, 124],[26, 126],[27, 126]])

export const dark_blue_Button = n165
const n166 = t([[12, 122],[13, 123],[14, 124],[15, 126],[16, 121],[17, 120],[18, 0],[19, 129],[20, 0],[21, 129],[22, 129],[23, 126],[24, 22],[25, 124],[26, 126],[27, 126]])

export const dark_blue_Checkbox = n166
export const dark_blue_Switch = n166
export const dark_blue_TooltipContent = n166
export const dark_blue_SliderTrack = n166
const n167 = t([[12, 0],[13, 0],[14, 129],[15, 128],[16, 0],[17, 0],[18, 119],[19, 120],[20, 119],[21, 120],[22, 119],[23, 128],[24, 127],[25, 129],[26, 128],[27, 120]])

export const dark_blue_SwitchThumb = n167
const n168 = t([[12, 127],[13, 22],[14, 126],[15, 124],[16, 128],[17, 129],[18, 119],[19, 120],[20, 119],[21, 120],[22, 120],[23, 124],[24, 123],[25, 126],[26, 124],[27, 124]])

export const dark_blue_SliderTrackActive = n168
const n169 = t([[12, 129],[13, 128],[14, 127],[15, 22],[16, 0],[17, 230],[18, 119],[19, 120],[20, 119],[21, 120],[22, 229],[23, 22],[24, 126],[25, 127],[26, 22],[27, 122]])

export const dark_blue_SliderThumb = n169
export const dark_blue_Tooltip = n169
export const dark_blue_ProgressIndicator = n169
const n170 = t([[12, 120],[13, 121],[14, 122],[15, 123],[16, 119],[17, 229],[18, 0],[19, 129],[20, 0],[21, 129],[22, 230],[23, 124],[24, 126],[25, 123],[26, 124],[27, 127]])

export const dark_blue_Input = n170
export const dark_blue_TextArea = n170
const n171 = t([[12, 175],[13, 176],[14, 177],[15, 178],[16, 174],[17, 231],[18, 0],[19, 184],[20, 0],[21, 184],[22, 232],[23, 178],[24, 179],[25, 177],[26, 178],[27, 182]])

export const dark_purple_ListItem = n171
const n172 = t([[12, 176],[13, 177],[14, 178],[15, 179],[16, 175],[17, 174],[18, 0],[19, 184],[20, 0],[21, 184],[22, 0],[23, 179],[24, 181],[25, 178],[26, 179],[27, 78]])

export const dark_purple_Card = n172
export const dark_purple_DrawerFrame = n172
export const dark_purple_Progress = n172
export const dark_purple_TooltipArrow = n172
const n173 = t([[12, 177],[13, 178],[14, 179],[15, 181],[16, 176],[17, 175],[18, 0],[19, 184],[20, 0],[21, 184],[22, 184],[23, 239],[24, 239],[25, 179],[26, 181],[27, 181]])

export const dark_purple_Button = n173
const n174 = t([[12, 177],[13, 178],[14, 179],[15, 181],[16, 176],[17, 175],[18, 0],[19, 184],[20, 0],[21, 184],[22, 184],[23, 181],[24, 78],[25, 179],[26, 181],[27, 181]])

export const dark_purple_Checkbox = n174
export const dark_purple_Switch = n174
export const dark_purple_TooltipContent = n174
export const dark_purple_SliderTrack = n174
const n175 = t([[12, 0],[13, 0],[14, 184],[15, 183],[16, 0],[17, 0],[18, 174],[19, 175],[20, 174],[21, 175],[22, 174],[23, 183],[24, 182],[25, 184],[26, 183],[27, 175]])

export const dark_purple_SwitchThumb = n175
const n176 = t([[12, 182],[13, 78],[14, 181],[15, 179],[16, 183],[17, 184],[18, 174],[19, 175],[20, 174],[21, 175],[22, 175],[23, 179],[24, 178],[25, 181],[26, 179],[27, 179]])

export const dark_purple_SliderTrackActive = n176
const n177 = t([[12, 184],[13, 183],[14, 182],[15, 78],[16, 0],[17, 232],[18, 174],[19, 175],[20, 174],[21, 175],[22, 231],[23, 78],[24, 181],[25, 182],[26, 78],[27, 177]])

export const dark_purple_SliderThumb = n177
export const dark_purple_Tooltip = n177
export const dark_purple_ProgressIndicator = n177
const n178 = t([[12, 175],[13, 176],[14, 177],[15, 178],[16, 174],[17, 231],[18, 0],[19, 184],[20, 0],[21, 184],[22, 232],[23, 179],[24, 181],[25, 178],[26, 179],[27, 182]])

export const dark_purple_Input = n178
export const dark_purple_TextArea = n178
const n179 = t([[12, 164],[13, 165],[14, 166],[15, 167],[16, 163],[17, 233],[18, 0],[19, 173],[20, 0],[21, 173],[22, 234],[23, 167],[24, 168],[25, 166],[26, 167],[27, 171]])

export const dark_pink_ListItem = n179
const n180 = t([[12, 165],[13, 166],[14, 167],[15, 168],[16, 164],[17, 163],[18, 0],[19, 173],[20, 0],[21, 173],[22, 0],[23, 168],[24, 170],[25, 167],[26, 168],[27, 66]])

export const dark_pink_Card = n180
export const dark_pink_DrawerFrame = n180
export const dark_pink_Progress = n180
export const dark_pink_TooltipArrow = n180
const n181 = t([[12, 166],[13, 167],[14, 168],[15, 170],[16, 165],[17, 164],[18, 0],[19, 173],[20, 0],[21, 173],[22, 173],[23, 239],[24, 239],[25, 168],[26, 170],[27, 170]])

export const dark_pink_Button = n181
const n182 = t([[12, 166],[13, 167],[14, 168],[15, 170],[16, 165],[17, 164],[18, 0],[19, 173],[20, 0],[21, 173],[22, 173],[23, 170],[24, 66],[25, 168],[26, 170],[27, 170]])

export const dark_pink_Checkbox = n182
export const dark_pink_Switch = n182
export const dark_pink_TooltipContent = n182
export const dark_pink_SliderTrack = n182
const n183 = t([[12, 0],[13, 0],[14, 173],[15, 172],[16, 0],[17, 0],[18, 163],[19, 164],[20, 163],[21, 164],[22, 163],[23, 172],[24, 171],[25, 173],[26, 172],[27, 164]])

export const dark_pink_SwitchThumb = n183
const n184 = t([[12, 171],[13, 66],[14, 170],[15, 168],[16, 172],[17, 173],[18, 163],[19, 164],[20, 163],[21, 164],[22, 164],[23, 168],[24, 167],[25, 170],[26, 168],[27, 168]])

export const dark_pink_SliderTrackActive = n184
const n185 = t([[12, 173],[13, 172],[14, 171],[15, 66],[16, 0],[17, 234],[18, 163],[19, 164],[20, 163],[21, 164],[22, 233],[23, 66],[24, 170],[25, 171],[26, 66],[27, 166]])

export const dark_pink_SliderThumb = n185
export const dark_pink_Tooltip = n185
export const dark_pink_ProgressIndicator = n185
const n186 = t([[12, 164],[13, 165],[14, 166],[15, 167],[16, 163],[17, 233],[18, 0],[19, 173],[20, 0],[21, 173],[22, 234],[23, 168],[24, 170],[25, 167],[26, 168],[27, 171]])

export const dark_pink_Input = n186
export const dark_pink_TextArea = n186
const n187 = t([[12, 186],[13, 187],[14, 188],[15, 189],[16, 185],[17, 235],[18, 0],[19, 195],[20, 0],[21, 195],[22, 236],[23, 189],[24, 190],[25, 188],[26, 189],[27, 193]])

export const dark_red_ListItem = n187
export const dark_accent_ListItem = n187
const n188 = t([[12, 187],[13, 188],[14, 189],[15, 190],[16, 186],[17, 185],[18, 0],[19, 195],[20, 0],[21, 195],[22, 0],[23, 190],[24, 192],[25, 189],[26, 190],[27, 90]])

export const dark_red_Card = n188
export const dark_red_DrawerFrame = n188
export const dark_red_Progress = n188
export const dark_red_TooltipArrow = n188
export const dark_accent_Card = n188
export const dark_accent_DrawerFrame = n188
export const dark_accent_Progress = n188
export const dark_accent_TooltipArrow = n188
const n189 = t([[12, 188],[13, 189],[14, 190],[15, 192],[16, 187],[17, 186],[18, 0],[19, 195],[20, 0],[21, 195],[22, 195],[23, 239],[24, 239],[25, 190],[26, 192],[27, 192]])

export const dark_red_Button = n189
export const dark_accent_Button = n189
const n190 = t([[12, 188],[13, 189],[14, 190],[15, 192],[16, 187],[17, 186],[18, 0],[19, 195],[20, 0],[21, 195],[22, 195],[23, 192],[24, 90],[25, 190],[26, 192],[27, 192]])

export const dark_red_Checkbox = n190
export const dark_red_Switch = n190
export const dark_red_TooltipContent = n190
export const dark_red_SliderTrack = n190
export const dark_accent_Checkbox = n190
export const dark_accent_Switch = n190
export const dark_accent_TooltipContent = n190
export const dark_accent_SliderTrack = n190
const n191 = t([[12, 0],[13, 0],[14, 195],[15, 194],[16, 0],[17, 0],[18, 185],[19, 186],[20, 185],[21, 186],[22, 185],[23, 194],[24, 193],[25, 195],[26, 194],[27, 186]])

export const dark_red_SwitchThumb = n191
export const dark_accent_SwitchThumb = n191
const n192 = t([[12, 193],[13, 90],[14, 192],[15, 190],[16, 194],[17, 195],[18, 185],[19, 186],[20, 185],[21, 186],[22, 186],[23, 190],[24, 189],[25, 192],[26, 190],[27, 190]])

export const dark_red_SliderTrackActive = n192
export const dark_accent_SliderTrackActive = n192
const n193 = t([[12, 195],[13, 194],[14, 193],[15, 90],[16, 0],[17, 236],[18, 185],[19, 186],[20, 185],[21, 186],[22, 235],[23, 90],[24, 192],[25, 193],[26, 90],[27, 188]])

export const dark_red_SliderThumb = n193
export const dark_red_Tooltip = n193
export const dark_red_ProgressIndicator = n193
export const dark_accent_SliderThumb = n193
export const dark_accent_Tooltip = n193
export const dark_accent_ProgressIndicator = n193
const n194 = t([[12, 186],[13, 187],[14, 188],[15, 189],[16, 185],[17, 235],[18, 0],[19, 195],[20, 0],[21, 195],[22, 236],[23, 190],[24, 192],[25, 189],[26, 190],[27, 193]])

export const dark_red_Input = n194
export const dark_red_TextArea = n194
export const dark_accent_Input = n194
export const dark_accent_TextArea = n194
const n195 = t([[12, 1],[13, 2],[14, 3],[15, 4],[16, 0],[17, 0],[18, 10],[19, 9],[20, 10],[21, 9],[22, 11],[23, 4],[24, 5],[25, 3],[26, 4],[27, 8]])

export const light_alt1_ListItem = n195
const n196 = t([[12, 3],[13, 4],[14, 5],[15, 6],[16, 2],[17, 1],[18, 10],[19, 9],[20, 10],[21, 9],[22, 10],[23, 6],[24, 7],[25, 5],[26, 6],[27, 6]])

export const light_alt1_Card = n196
export const light_alt1_DrawerFrame = n196
export const light_alt1_Progress = n196
export const light_alt1_TooltipArrow = n196
const n197 = t([[12, 4],[13, 5],[14, 6],[15, 7],[16, 3],[17, 2],[18, 10],[19, 9],[20, 10],[21, 9],[22, 9],[23, 239],[24, 239],[25, 6],[26, 7],[27, 5]])

export const light_alt1_Button = n197
const n198 = t([[12, 4],[13, 5],[14, 6],[15, 7],[16, 3],[17, 2],[18, 10],[19, 9],[20, 10],[21, 9],[22, 9],[23, 7],[24, 8],[25, 6],[26, 7],[27, 5]])

export const light_alt1_Checkbox = n198
export const light_alt1_Switch = n198
export const light_alt1_TooltipContent = n198
export const light_alt1_SliderTrack = n198
const n199 = t([[12, 11],[13, 10],[14, 9],[15, 8],[16, 11],[17, 11],[18, 1],[19, 2],[20, 1],[21, 2],[22, 0],[23, 8],[24, 7],[25, 9],[26, 8],[27, 2]])

export const light_alt1_SwitchThumb = n199
const n200 = t([[12, 7],[13, 6],[14, 5],[15, 4],[16, 8],[17, 9],[18, 1],[19, 2],[20, 1],[21, 2],[22, 2],[23, 4],[24, 3],[25, 5],[26, 4],[27, 6]])

export const light_alt1_SliderTrackActive = n200
const n201 = t([[12, 9],[13, 8],[14, 7],[15, 6],[16, 10],[17, 11],[18, 1],[19, 2],[20, 1],[21, 2],[22, 0],[23, 6],[24, 5],[25, 7],[26, 6],[27, 4]])

export const light_alt1_SliderThumb = n201
export const light_alt1_Tooltip = n201
export const light_alt1_ProgressIndicator = n201
const n202 = t([[12, 1],[13, 2],[14, 3],[15, 4],[16, 0],[17, 0],[18, 10],[19, 9],[20, 10],[21, 9],[22, 11],[23, 6],[24, 7],[25, 5],[26, 6],[27, 8]])

export const light_alt1_Input = n202
export const light_alt1_TextArea = n202
const n203 = t([[12, 2],[13, 3],[14, 4],[15, 5],[16, 1],[17, 0],[18, 9],[19, 8],[20, 9],[21, 8],[22, 11],[23, 5],[24, 6],[25, 4],[26, 5],[27, 7]])

export const light_alt2_ListItem = n203
const n204 = t([[12, 4],[13, 5],[14, 6],[15, 7],[16, 3],[17, 2],[18, 9],[19, 8],[20, 9],[21, 8],[22, 9],[23, 7],[24, 8],[25, 6],[26, 7],[27, 5]])

export const light_alt2_Card = n204
export const light_alt2_DrawerFrame = n204
export const light_alt2_Progress = n204
export const light_alt2_TooltipArrow = n204
const n205 = t([[12, 5],[13, 6],[14, 7],[15, 8],[16, 4],[17, 3],[18, 9],[19, 8],[20, 9],[21, 8],[22, 8],[23, 239],[24, 239],[25, 7],[26, 8],[27, 4]])

export const light_alt2_Button = n205
const n206 = t([[12, 5],[13, 6],[14, 7],[15, 8],[16, 4],[17, 3],[18, 9],[19, 8],[20, 9],[21, 8],[22, 8],[23, 8],[24, 9],[25, 7],[26, 8],[27, 4]])

export const light_alt2_Checkbox = n206
export const light_alt2_Switch = n206
export const light_alt2_TooltipContent = n206
export const light_alt2_SliderTrack = n206
const n207 = t([[12, 10],[13, 9],[14, 8],[15, 7],[16, 11],[17, 11],[18, 2],[19, 3],[20, 2],[21, 3],[22, 0],[23, 7],[24, 6],[25, 8],[26, 7],[27, 3]])

export const light_alt2_SwitchThumb = n207
const n208 = t([[12, 6],[13, 5],[14, 4],[15, 3],[16, 7],[17, 8],[18, 2],[19, 3],[20, 2],[21, 3],[22, 3],[23, 3],[24, 2],[25, 4],[26, 3],[27, 7]])

export const light_alt2_SliderTrackActive = n208
const n209 = t([[12, 8],[13, 7],[14, 6],[15, 5],[16, 9],[17, 10],[18, 2],[19, 3],[20, 2],[21, 3],[22, 1],[23, 5],[24, 4],[25, 6],[26, 5],[27, 5]])

export const light_alt2_SliderThumb = n209
export const light_alt2_Tooltip = n209
export const light_alt2_ProgressIndicator = n209
const n210 = t([[12, 2],[13, 3],[14, 4],[15, 5],[16, 1],[17, 0],[18, 9],[19, 8],[20, 9],[21, 8],[22, 11],[23, 7],[24, 8],[25, 6],[26, 7],[27, 7]])

export const light_alt2_Input = n210
export const light_alt2_TextArea = n210
const n211 = t([[12, 3],[13, 4],[14, 5],[15, 6],[16, 2],[17, 1],[19, 7],[20, 8],[21, 7],[22, 10],[23, 6],[24, 7],[25, 5],[26, 6],[27, 6]])

export const light_active_ListItem = n211
const n212 = t([[12, 5],[13, 6],[14, 7],[15, 8],[16, 4],[17, 3],[19, 7],[20, 8],[21, 7],[22, 8],[23, 8],[24, 9],[25, 7],[26, 8],[27, 4]])

export const light_active_Card = n212
export const light_active_DrawerFrame = n212
export const light_active_Progress = n212
export const light_active_TooltipArrow = n212
const n213 = t([[12, 6],[13, 7],[14, 8],[15, 9],[16, 5],[17, 4],[19, 7],[20, 8],[21, 7],[22, 7],[23, 239],[24, 239],[25, 8],[26, 9],[27, 3]])

export const light_active_Button = n213
const n214 = t([[12, 6],[13, 7],[14, 8],[15, 9],[16, 5],[17, 4],[19, 7],[20, 8],[21, 7],[22, 7],[23, 9],[24, 10],[25, 8],[26, 9],[27, 3]])

export const light_active_Checkbox = n214
export const light_active_Switch = n214
export const light_active_TooltipContent = n214
export const light_active_SliderTrack = n214
const n215 = t([[12, 9],[13, 8],[14, 7],[15, 6],[16, 10],[17, 11],[19, 4],[20, 3],[21, 4],[22, 0],[23, 6],[24, 5],[25, 7],[26, 6],[27, 4]])

export const light_active_SwitchThumb = n215
const n216 = t([[12, 5],[13, 4],[14, 3],[15, 2],[16, 6],[17, 7],[19, 4],[20, 3],[21, 4],[22, 4],[23, 2],[24, 1],[25, 3],[26, 2],[27, 8]])

export const light_active_SliderTrackActive = n216
const n217 = t([[12, 7],[13, 6],[14, 5],[15, 4],[16, 8],[17, 9],[19, 4],[20, 3],[21, 4],[22, 2],[23, 4],[24, 3],[25, 5],[26, 4],[27, 6]])

export const light_active_SliderThumb = n217
export const light_active_Tooltip = n217
export const light_active_ProgressIndicator = n217
const n218 = t([[12, 3],[13, 4],[14, 5],[15, 6],[16, 2],[17, 1],[19, 7],[20, 8],[21, 7],[22, 10],[23, 8],[24, 9],[25, 7],[26, 8],[27, 6]])

export const light_active_Input = n218
export const light_active_TextArea = n218
const n219 = t([[12, 110],[13, 111],[14, 112],[15, 113],[16, 109],[17, 108],[18, 118],[19, 117],[20, 118],[21, 117],[22, 0],[23, 113],[24, 114],[25, 112],[26, 113],[27, 115]])

export const dark_alt1_ListItem = n219
const n220 = t([[12, 111],[13, 112],[14, 113],[15, 114],[16, 110],[17, 109],[18, 118],[19, 117],[20, 118],[21, 117],[22, 118],[23, 114],[24, 115],[25, 113],[26, 114],[27, 114]])

export const dark_alt1_Card = n220
export const dark_alt1_DrawerFrame = n220
export const dark_alt1_Progress = n220
export const dark_alt1_TooltipArrow = n220
const n221 = t([[12, 112],[13, 113],[14, 114],[15, 115],[16, 111],[17, 110],[18, 118],[19, 117],[20, 118],[21, 117],[22, 117],[23, 239],[24, 239],[25, 114],[26, 115],[27, 113]])

export const dark_alt1_Button = n221
const n222 = t([[12, 112],[13, 113],[14, 114],[15, 115],[16, 111],[17, 110],[18, 118],[19, 117],[20, 118],[21, 117],[22, 117],[23, 115],[24, 116],[25, 114],[26, 115],[27, 113]])

export const dark_alt1_Checkbox = n222
export const dark_alt1_Switch = n222
export const dark_alt1_TooltipContent = n222
export const dark_alt1_SliderTrack = n222
const n223 = t([[12, 0],[13, 118],[14, 117],[15, 116],[16, 0],[17, 0],[18, 109],[19, 110],[20, 109],[21, 110],[22, 108],[23, 116],[24, 115],[25, 117],[26, 116],[27, 110]])

export const dark_alt1_SwitchThumb = n223
const n224 = t([[12, 115],[13, 114],[14, 113],[15, 112],[16, 116],[17, 117],[18, 109],[19, 110],[20, 109],[21, 110],[22, 110],[23, 112],[24, 111],[25, 113],[26, 112],[27, 114]])

export const dark_alt1_SliderTrackActive = n224
const n225 = t([[12, 117],[13, 116],[14, 115],[15, 114],[16, 118],[17, 0],[18, 109],[19, 110],[20, 109],[21, 110],[22, 108],[23, 114],[24, 113],[25, 115],[26, 114],[27, 112]])

export const dark_alt1_SliderThumb = n225
export const dark_alt1_Tooltip = n225
export const dark_alt1_ProgressIndicator = n225
const n226 = t([[12, 110],[13, 111],[14, 112],[15, 113],[16, 109],[17, 108],[18, 118],[19, 117],[20, 118],[21, 117],[22, 0],[23, 114],[24, 115],[25, 113],[26, 114],[27, 115]])

export const dark_alt1_Input = n226
export const dark_alt1_TextArea = n226
const n227 = t([[12, 111],[13, 112],[14, 113],[15, 114],[16, 110],[17, 109],[18, 117],[19, 116],[20, 117],[21, 116],[22, 118],[23, 114],[24, 115],[25, 113],[26, 114],[27, 114]])

export const dark_alt2_ListItem = n227
const n228 = t([[12, 112],[13, 113],[14, 114],[15, 115],[16, 111],[17, 110],[18, 117],[19, 116],[20, 117],[21, 116],[22, 117],[23, 115],[24, 116],[25, 114],[26, 115],[27, 113]])

export const dark_alt2_Card = n228
export const dark_alt2_DrawerFrame = n228
export const dark_alt2_Progress = n228
export const dark_alt2_TooltipArrow = n228
const n229 = t([[12, 113],[13, 114],[14, 115],[15, 116],[16, 112],[17, 111],[18, 117],[19, 116],[20, 117],[21, 116],[22, 116],[23, 239],[24, 239],[25, 115],[26, 116],[27, 112]])

export const dark_alt2_Button = n229
const n230 = t([[12, 113],[13, 114],[14, 115],[15, 116],[16, 112],[17, 111],[18, 117],[19, 116],[20, 117],[21, 116],[22, 116],[23, 116],[24, 117],[25, 115],[26, 116],[27, 112]])

export const dark_alt2_Checkbox = n230
export const dark_alt2_Switch = n230
export const dark_alt2_TooltipContent = n230
export const dark_alt2_SliderTrack = n230
const n231 = t([[12, 118],[13, 117],[14, 116],[15, 115],[16, 0],[17, 0],[18, 110],[19, 111],[20, 110],[21, 111],[22, 108],[23, 115],[24, 114],[25, 116],[26, 115],[27, 111]])

export const dark_alt2_SwitchThumb = n231
const n232 = t([[12, 114],[13, 113],[14, 112],[15, 111],[16, 115],[17, 116],[18, 110],[19, 111],[20, 110],[21, 111],[22, 111],[23, 111],[24, 110],[25, 112],[26, 111],[27, 115]])

export const dark_alt2_SliderTrackActive = n232
const n233 = t([[12, 116],[13, 115],[14, 114],[15, 113],[16, 117],[17, 118],[18, 110],[19, 111],[20, 110],[21, 111],[22, 109],[23, 113],[24, 112],[25, 114],[26, 113],[27, 113]])

export const dark_alt2_SliderThumb = n233
export const dark_alt2_Tooltip = n233
export const dark_alt2_ProgressIndicator = n233
const n234 = t([[12, 111],[13, 112],[14, 113],[15, 114],[16, 110],[17, 109],[18, 117],[19, 116],[20, 117],[21, 116],[22, 118],[23, 115],[24, 116],[25, 114],[26, 115],[27, 114]])

export const dark_alt2_Input = n234
export const dark_alt2_TextArea = n234
const n235 = t([[12, 112],[13, 113],[14, 114],[15, 115],[16, 111],[17, 110],[19, 115],[20, 116],[21, 115],[22, 117],[23, 115],[24, 116],[25, 114],[26, 115],[27, 113]])

export const dark_active_ListItem = n235
const n236 = t([[12, 113],[13, 114],[14, 115],[15, 116],[16, 112],[17, 111],[19, 115],[20, 116],[21, 115],[22, 116],[23, 116],[24, 117],[25, 115],[26, 116],[27, 112]])

export const dark_active_Card = n236
export const dark_active_DrawerFrame = n236
export const dark_active_Progress = n236
export const dark_active_TooltipArrow = n236
const n237 = t([[12, 114],[13, 115],[14, 116],[15, 117],[16, 113],[17, 112],[19, 115],[20, 116],[21, 115],[22, 115],[23, 239],[24, 239],[25, 116],[26, 117],[27, 111]])

export const dark_active_Button = n237
const n238 = t([[12, 114],[13, 115],[14, 116],[15, 117],[16, 113],[17, 112],[19, 115],[20, 116],[21, 115],[22, 115],[23, 117],[24, 118],[25, 116],[26, 117],[27, 111]])

export const dark_active_Checkbox = n238
export const dark_active_Switch = n238
export const dark_active_TooltipContent = n238
export const dark_active_SliderTrack = n238
const n239 = t([[12, 117],[13, 116],[14, 115],[15, 114],[16, 118],[17, 0],[19, 112],[20, 111],[21, 112],[22, 108],[23, 114],[24, 113],[25, 115],[26, 114],[27, 112]])

export const dark_active_SwitchThumb = n239
const n240 = t([[12, 113],[13, 112],[14, 111],[15, 110],[16, 114],[17, 115],[19, 112],[20, 111],[21, 112],[22, 112],[23, 110],[24, 109],[25, 111],[26, 110],[27, 116]])

export const dark_active_SliderTrackActive = n240
const n241 = t([[12, 115],[13, 114],[14, 113],[15, 112],[16, 116],[17, 117],[19, 112],[20, 111],[21, 112],[22, 110],[23, 112],[24, 111],[25, 113],[26, 112],[27, 114]])

export const dark_active_SliderThumb = n241
export const dark_active_Tooltip = n241
export const dark_active_ProgressIndicator = n241
const n242 = t([[12, 112],[13, 113],[14, 114],[15, 115],[16, 111],[17, 110],[19, 115],[20, 116],[21, 115],[22, 117],[23, 116],[24, 117],[25, 115],[26, 116],[27, 113]])

export const dark_active_Input = n242
export const dark_active_TextArea = n242
const n243 = t([[12, 47],[13, 48],[14, 49],[15, 50],[16, 46],[17, 46],[18, 57],[19, 56],[20, 57],[21, 56],[22, 11],[23, 49],[24, 50],[25, 49],[26, 49],[27, 55]])

export const light_orange_alt1_ListItem = n243
const n244 = t([[12, 49],[13, 50],[14, 51],[15, 53],[16, 48],[17, 47],[18, 57],[19, 56],[20, 57],[21, 56],[22, 57],[23, 51],[24, 53],[25, 51],[26, 51],[27, 53]])

export const light_orange_alt1_Card = n244
export const light_orange_alt1_DrawerFrame = n244
export const light_orange_alt1_Progress = n244
export const light_orange_alt1_TooltipArrow = n244
const n245 = t([[12, 50],[13, 51],[14, 53],[15, 54],[16, 49],[17, 48],[18, 57],[19, 56],[20, 57],[21, 56],[22, 56],[23, 239],[24, 239],[25, 53],[26, 53],[27, 51]])

export const light_orange_alt1_Button = n245
const n246 = t([[12, 50],[13, 51],[14, 53],[15, 54],[16, 49],[17, 48],[18, 57],[19, 56],[20, 57],[21, 56],[22, 56],[23, 53],[24, 54],[25, 53],[26, 53],[27, 51]])

export const light_orange_alt1_Checkbox = n246
export const light_orange_alt1_Switch = n246
export const light_orange_alt1_TooltipContent = n246
export const light_orange_alt1_SliderTrack = n246
const n247 = t([[12, 11],[13, 57],[14, 56],[15, 55],[16, 11],[17, 11],[18, 47],[19, 48],[20, 47],[21, 48],[22, 46],[23, 56],[24, 55],[25, 56],[26, 56],[27, 48]])

export const light_orange_alt1_SwitchThumb = n247
const n248 = t([[12, 54],[13, 53],[14, 51],[15, 50],[16, 55],[17, 56],[18, 47],[19, 48],[20, 47],[21, 48],[22, 48],[23, 51],[24, 50],[25, 51],[26, 51],[27, 53]])

export const light_orange_alt1_SliderTrackActive = n248
const n249 = t([[12, 56],[13, 55],[14, 54],[15, 53],[16, 57],[17, 11],[18, 47],[19, 48],[20, 47],[21, 48],[22, 46],[23, 54],[24, 53],[25, 54],[26, 54],[27, 50]])

export const light_orange_alt1_SliderThumb = n249
export const light_orange_alt1_Tooltip = n249
export const light_orange_alt1_ProgressIndicator = n249
const n250 = t([[12, 47],[13, 48],[14, 49],[15, 50],[16, 46],[17, 46],[18, 57],[19, 56],[20, 57],[21, 56],[22, 11],[23, 51],[24, 53],[25, 51],[26, 51],[27, 55]])

export const light_orange_alt1_Input = n250
export const light_orange_alt1_TextArea = n250
const n251 = t([[12, 48],[13, 49],[14, 50],[15, 51],[16, 47],[17, 46],[18, 56],[19, 55],[20, 56],[21, 55],[22, 11],[23, 50],[24, 51],[25, 50],[26, 50],[27, 54]])

export const light_orange_alt2_ListItem = n251
const n252 = t([[12, 50],[13, 51],[14, 53],[15, 54],[16, 49],[17, 48],[18, 56],[19, 55],[20, 56],[21, 55],[22, 56],[23, 53],[24, 54],[25, 53],[26, 53],[27, 51]])

export const light_orange_alt2_Card = n252
export const light_orange_alt2_DrawerFrame = n252
export const light_orange_alt2_Progress = n252
export const light_orange_alt2_TooltipArrow = n252
const n253 = t([[12, 51],[13, 53],[14, 54],[15, 55],[16, 50],[17, 49],[18, 56],[19, 55],[20, 56],[21, 55],[22, 55],[23, 239],[24, 239],[25, 54],[26, 54],[27, 50]])

export const light_orange_alt2_Button = n253
const n254 = t([[12, 51],[13, 53],[14, 54],[15, 55],[16, 50],[17, 49],[18, 56],[19, 55],[20, 56],[21, 55],[22, 55],[23, 54],[24, 55],[25, 54],[26, 54],[27, 50]])

export const light_orange_alt2_Checkbox = n254
export const light_orange_alt2_Switch = n254
export const light_orange_alt2_TooltipContent = n254
export const light_orange_alt2_SliderTrack = n254
const n255 = t([[12, 57],[13, 56],[14, 55],[15, 54],[16, 11],[17, 11],[18, 48],[19, 49],[20, 48],[21, 49],[22, 46],[23, 55],[24, 54],[25, 55],[26, 55],[27, 49]])

export const light_orange_alt2_SwitchThumb = n255
const n256 = t([[12, 53],[13, 51],[14, 50],[15, 49],[16, 54],[17, 55],[18, 48],[19, 49],[20, 48],[21, 49],[22, 49],[23, 50],[24, 49],[25, 50],[26, 50],[27, 54]])

export const light_orange_alt2_SliderTrackActive = n256
const n257 = t([[12, 55],[13, 54],[14, 53],[15, 51],[16, 56],[17, 57],[18, 48],[19, 49],[20, 48],[21, 49],[22, 47],[23, 53],[24, 51],[25, 53],[26, 53],[27, 51]])

export const light_orange_alt2_SliderThumb = n257
export const light_orange_alt2_Tooltip = n257
export const light_orange_alt2_ProgressIndicator = n257
const n258 = t([[12, 48],[13, 49],[14, 50],[15, 51],[16, 47],[17, 46],[18, 56],[19, 55],[20, 56],[21, 55],[22, 11],[23, 53],[24, 54],[25, 53],[26, 53],[27, 54]])

export const light_orange_alt2_Input = n258
export const light_orange_alt2_TextArea = n258
const n259 = t([[12, 49],[13, 50],[14, 51],[15, 53],[16, 48],[17, 47],[19, 54],[20, 55],[21, 54],[22, 57],[23, 51],[24, 53],[25, 51],[26, 51],[27, 53]])

export const light_orange_active_ListItem = n259
const n260 = t([[12, 51],[13, 53],[14, 54],[15, 55],[16, 50],[17, 49],[19, 54],[20, 55],[21, 54],[22, 55],[23, 54],[24, 55],[25, 54],[26, 54],[27, 50]])

export const light_orange_active_Card = n260
export const light_orange_active_DrawerFrame = n260
export const light_orange_active_Progress = n260
export const light_orange_active_TooltipArrow = n260
const n261 = t([[12, 53],[13, 54],[14, 55],[15, 56],[16, 51],[17, 50],[19, 54],[20, 55],[21, 54],[22, 54],[23, 239],[24, 239],[25, 55],[26, 55],[27, 49]])

export const light_orange_active_Button = n261
const n262 = t([[12, 53],[13, 54],[14, 55],[15, 56],[16, 51],[17, 50],[19, 54],[20, 55],[21, 54],[22, 54],[23, 55],[24, 56],[25, 55],[26, 55],[27, 49]])

export const light_orange_active_Checkbox = n262
export const light_orange_active_Switch = n262
export const light_orange_active_TooltipContent = n262
export const light_orange_active_SliderTrack = n262
const n263 = t([[12, 56],[13, 55],[14, 54],[15, 53],[16, 57],[17, 11],[19, 50],[20, 49],[21, 50],[22, 46],[23, 54],[24, 53],[25, 54],[26, 54],[27, 50]])

export const light_orange_active_SwitchThumb = n263
const n264 = t([[12, 51],[13, 50],[14, 49],[15, 48],[16, 53],[17, 54],[19, 50],[20, 49],[21, 50],[22, 50],[23, 49],[24, 48],[25, 49],[26, 49],[27, 55]])

export const light_orange_active_SliderTrackActive = n264
const n265 = t([[12, 54],[13, 53],[14, 51],[15, 50],[16, 55],[17, 56],[19, 50],[20, 49],[21, 50],[22, 48],[23, 51],[24, 50],[25, 51],[26, 51],[27, 53]])

export const light_orange_active_SliderThumb = n265
export const light_orange_active_Tooltip = n265
export const light_orange_active_ProgressIndicator = n265
const n266 = t([[12, 49],[13, 50],[14, 51],[15, 53],[16, 48],[17, 47],[19, 54],[20, 55],[21, 54],[22, 57],[23, 54],[24, 55],[25, 54],[26, 54],[27, 53]])

export const light_orange_active_Input = n266
export const light_orange_active_TextArea = n266
const n267 = t([[12, 95],[13, 96],[14, 97],[15, 98],[16, 94],[17, 94],[18, 105],[19, 104],[20, 105],[21, 104],[22, 11],[23, 97],[24, 98],[25, 97],[26, 97],[27, 103]])

export const light_yellow_alt1_ListItem = n267
const n268 = t([[12, 97],[13, 98],[14, 99],[15, 101],[16, 96],[17, 95],[18, 105],[19, 104],[20, 105],[21, 104],[22, 105],[23, 99],[24, 101],[25, 99],[26, 99],[27, 101]])

export const light_yellow_alt1_Card = n268
export const light_yellow_alt1_DrawerFrame = n268
export const light_yellow_alt1_Progress = n268
export const light_yellow_alt1_TooltipArrow = n268
const n269 = t([[12, 98],[13, 99],[14, 101],[15, 102],[16, 97],[17, 96],[18, 105],[19, 104],[20, 105],[21, 104],[22, 104],[23, 239],[24, 239],[25, 101],[26, 101],[27, 99]])

export const light_yellow_alt1_Button = n269
const n270 = t([[12, 98],[13, 99],[14, 101],[15, 102],[16, 97],[17, 96],[18, 105],[19, 104],[20, 105],[21, 104],[22, 104],[23, 101],[24, 102],[25, 101],[26, 101],[27, 99]])

export const light_yellow_alt1_Checkbox = n270
export const light_yellow_alt1_Switch = n270
export const light_yellow_alt1_TooltipContent = n270
export const light_yellow_alt1_SliderTrack = n270
const n271 = t([[12, 11],[13, 105],[14, 104],[15, 103],[16, 11],[17, 11],[18, 95],[19, 96],[20, 95],[21, 96],[22, 94],[23, 104],[24, 103],[25, 104],[26, 104],[27, 96]])

export const light_yellow_alt1_SwitchThumb = n271
const n272 = t([[12, 102],[13, 101],[14, 99],[15, 98],[16, 103],[17, 104],[18, 95],[19, 96],[20, 95],[21, 96],[22, 96],[23, 99],[24, 98],[25, 99],[26, 99],[27, 101]])

export const light_yellow_alt1_SliderTrackActive = n272
const n273 = t([[12, 104],[13, 103],[14, 102],[15, 101],[16, 105],[17, 11],[18, 95],[19, 96],[20, 95],[21, 96],[22, 94],[23, 102],[24, 101],[25, 102],[26, 102],[27, 98]])

export const light_yellow_alt1_SliderThumb = n273
export const light_yellow_alt1_Tooltip = n273
export const light_yellow_alt1_ProgressIndicator = n273
const n274 = t([[12, 95],[13, 96],[14, 97],[15, 98],[16, 94],[17, 94],[18, 105],[19, 104],[20, 105],[21, 104],[22, 11],[23, 99],[24, 101],[25, 99],[26, 99],[27, 103]])

export const light_yellow_alt1_Input = n274
export const light_yellow_alt1_TextArea = n274
const n275 = t([[12, 96],[13, 97],[14, 98],[15, 99],[16, 95],[17, 94],[18, 104],[19, 103],[20, 104],[21, 103],[22, 11],[23, 98],[24, 99],[25, 98],[26, 98],[27, 102]])

export const light_yellow_alt2_ListItem = n275
const n276 = t([[12, 98],[13, 99],[14, 101],[15, 102],[16, 97],[17, 96],[18, 104],[19, 103],[20, 104],[21, 103],[22, 104],[23, 101],[24, 102],[25, 101],[26, 101],[27, 99]])

export const light_yellow_alt2_Card = n276
export const light_yellow_alt2_DrawerFrame = n276
export const light_yellow_alt2_Progress = n276
export const light_yellow_alt2_TooltipArrow = n276
const n277 = t([[12, 99],[13, 101],[14, 102],[15, 103],[16, 98],[17, 97],[18, 104],[19, 103],[20, 104],[21, 103],[22, 103],[23, 239],[24, 239],[25, 102],[26, 102],[27, 98]])

export const light_yellow_alt2_Button = n277
const n278 = t([[12, 99],[13, 101],[14, 102],[15, 103],[16, 98],[17, 97],[18, 104],[19, 103],[20, 104],[21, 103],[22, 103],[23, 102],[24, 103],[25, 102],[26, 102],[27, 98]])

export const light_yellow_alt2_Checkbox = n278
export const light_yellow_alt2_Switch = n278
export const light_yellow_alt2_TooltipContent = n278
export const light_yellow_alt2_SliderTrack = n278
const n279 = t([[12, 105],[13, 104],[14, 103],[15, 102],[16, 11],[17, 11],[18, 96],[19, 97],[20, 96],[21, 97],[22, 94],[23, 103],[24, 102],[25, 103],[26, 103],[27, 97]])

export const light_yellow_alt2_SwitchThumb = n279
const n280 = t([[12, 101],[13, 99],[14, 98],[15, 97],[16, 102],[17, 103],[18, 96],[19, 97],[20, 96],[21, 97],[22, 97],[23, 98],[24, 97],[25, 98],[26, 98],[27, 102]])

export const light_yellow_alt2_SliderTrackActive = n280
const n281 = t([[12, 103],[13, 102],[14, 101],[15, 99],[16, 104],[17, 105],[18, 96],[19, 97],[20, 96],[21, 97],[22, 95],[23, 101],[24, 99],[25, 101],[26, 101],[27, 99]])

export const light_yellow_alt2_SliderThumb = n281
export const light_yellow_alt2_Tooltip = n281
export const light_yellow_alt2_ProgressIndicator = n281
const n282 = t([[12, 96],[13, 97],[14, 98],[15, 99],[16, 95],[17, 94],[18, 104],[19, 103],[20, 104],[21, 103],[22, 11],[23, 101],[24, 102],[25, 101],[26, 101],[27, 102]])

export const light_yellow_alt2_Input = n282
export const light_yellow_alt2_TextArea = n282
const n283 = t([[12, 97],[13, 98],[14, 99],[15, 101],[16, 96],[17, 95],[19, 102],[20, 103],[21, 102],[22, 105],[23, 99],[24, 101],[25, 99],[26, 99],[27, 101]])

export const light_yellow_active_ListItem = n283
const n284 = t([[12, 99],[13, 101],[14, 102],[15, 103],[16, 98],[17, 97],[19, 102],[20, 103],[21, 102],[22, 103],[23, 102],[24, 103],[25, 102],[26, 102],[27, 98]])

export const light_yellow_active_Card = n284
export const light_yellow_active_DrawerFrame = n284
export const light_yellow_active_Progress = n284
export const light_yellow_active_TooltipArrow = n284
const n285 = t([[12, 101],[13, 102],[14, 103],[15, 104],[16, 99],[17, 98],[19, 102],[20, 103],[21, 102],[22, 102],[23, 239],[24, 239],[25, 103],[26, 103],[27, 97]])

export const light_yellow_active_Button = n285
const n286 = t([[12, 101],[13, 102],[14, 103],[15, 104],[16, 99],[17, 98],[19, 102],[20, 103],[21, 102],[22, 102],[23, 103],[24, 104],[25, 103],[26, 103],[27, 97]])

export const light_yellow_active_Checkbox = n286
export const light_yellow_active_Switch = n286
export const light_yellow_active_TooltipContent = n286
export const light_yellow_active_SliderTrack = n286
const n287 = t([[12, 104],[13, 103],[14, 102],[15, 101],[16, 105],[17, 11],[19, 98],[20, 97],[21, 98],[22, 94],[23, 102],[24, 101],[25, 102],[26, 102],[27, 98]])

export const light_yellow_active_SwitchThumb = n287
const n288 = t([[12, 99],[13, 98],[14, 97],[15, 96],[16, 101],[17, 102],[19, 98],[20, 97],[21, 98],[22, 98],[23, 97],[24, 96],[25, 97],[26, 97],[27, 103]])

export const light_yellow_active_SliderTrackActive = n288
const n289 = t([[12, 102],[13, 101],[14, 99],[15, 98],[16, 103],[17, 104],[19, 98],[20, 97],[21, 98],[22, 96],[23, 99],[24, 98],[25, 99],[26, 99],[27, 101]])

export const light_yellow_active_SliderThumb = n289
export const light_yellow_active_Tooltip = n289
export const light_yellow_active_ProgressIndicator = n289
const n290 = t([[12, 97],[13, 98],[14, 99],[15, 101],[16, 96],[17, 95],[19, 102],[20, 103],[21, 102],[22, 105],[23, 102],[24, 103],[25, 102],[26, 102],[27, 101]])

export const light_yellow_active_Input = n290
export const light_yellow_active_TextArea = n290
const n291 = t([[12, 35],[13, 36],[14, 37],[15, 38],[16, 34],[17, 34],[18, 45],[19, 44],[20, 45],[21, 44],[22, 11],[23, 37],[24, 38],[25, 37],[26, 37],[27, 43]])

export const light_green_alt1_ListItem = n291
const n292 = t([[12, 37],[13, 38],[14, 39],[15, 41],[16, 36],[17, 35],[18, 45],[19, 44],[20, 45],[21, 44],[22, 45],[23, 39],[24, 41],[25, 39],[26, 39],[27, 41]])

export const light_green_alt1_Card = n292
export const light_green_alt1_DrawerFrame = n292
export const light_green_alt1_Progress = n292
export const light_green_alt1_TooltipArrow = n292
const n293 = t([[12, 38],[13, 39],[14, 41],[15, 42],[16, 37],[17, 36],[18, 45],[19, 44],[20, 45],[21, 44],[22, 44],[23, 239],[24, 239],[25, 41],[26, 41],[27, 39]])

export const light_green_alt1_Button = n293
const n294 = t([[12, 38],[13, 39],[14, 41],[15, 42],[16, 37],[17, 36],[18, 45],[19, 44],[20, 45],[21, 44],[22, 44],[23, 41],[24, 42],[25, 41],[26, 41],[27, 39]])

export const light_green_alt1_Checkbox = n294
export const light_green_alt1_Switch = n294
export const light_green_alt1_TooltipContent = n294
export const light_green_alt1_SliderTrack = n294
const n295 = t([[12, 11],[13, 45],[14, 44],[15, 43],[16, 11],[17, 11],[18, 35],[19, 36],[20, 35],[21, 36],[22, 34],[23, 44],[24, 43],[25, 44],[26, 44],[27, 36]])

export const light_green_alt1_SwitchThumb = n295
const n296 = t([[12, 42],[13, 41],[14, 39],[15, 38],[16, 43],[17, 44],[18, 35],[19, 36],[20, 35],[21, 36],[22, 36],[23, 39],[24, 38],[25, 39],[26, 39],[27, 41]])

export const light_green_alt1_SliderTrackActive = n296
const n297 = t([[12, 44],[13, 43],[14, 42],[15, 41],[16, 45],[17, 11],[18, 35],[19, 36],[20, 35],[21, 36],[22, 34],[23, 42],[24, 41],[25, 42],[26, 42],[27, 38]])

export const light_green_alt1_SliderThumb = n297
export const light_green_alt1_Tooltip = n297
export const light_green_alt1_ProgressIndicator = n297
const n298 = t([[12, 35],[13, 36],[14, 37],[15, 38],[16, 34],[17, 34],[18, 45],[19, 44],[20, 45],[21, 44],[22, 11],[23, 39],[24, 41],[25, 39],[26, 39],[27, 43]])

export const light_green_alt1_Input = n298
export const light_green_alt1_TextArea = n298
const n299 = t([[12, 36],[13, 37],[14, 38],[15, 39],[16, 35],[17, 34],[18, 44],[19, 43],[20, 44],[21, 43],[22, 11],[23, 38],[24, 39],[25, 38],[26, 38],[27, 42]])

export const light_green_alt2_ListItem = n299
const n300 = t([[12, 38],[13, 39],[14, 41],[15, 42],[16, 37],[17, 36],[18, 44],[19, 43],[20, 44],[21, 43],[22, 44],[23, 41],[24, 42],[25, 41],[26, 41],[27, 39]])

export const light_green_alt2_Card = n300
export const light_green_alt2_DrawerFrame = n300
export const light_green_alt2_Progress = n300
export const light_green_alt2_TooltipArrow = n300
const n301 = t([[12, 39],[13, 41],[14, 42],[15, 43],[16, 38],[17, 37],[18, 44],[19, 43],[20, 44],[21, 43],[22, 43],[23, 239],[24, 239],[25, 42],[26, 42],[27, 38]])

export const light_green_alt2_Button = n301
const n302 = t([[12, 39],[13, 41],[14, 42],[15, 43],[16, 38],[17, 37],[18, 44],[19, 43],[20, 44],[21, 43],[22, 43],[23, 42],[24, 43],[25, 42],[26, 42],[27, 38]])

export const light_green_alt2_Checkbox = n302
export const light_green_alt2_Switch = n302
export const light_green_alt2_TooltipContent = n302
export const light_green_alt2_SliderTrack = n302
const n303 = t([[12, 45],[13, 44],[14, 43],[15, 42],[16, 11],[17, 11],[18, 36],[19, 37],[20, 36],[21, 37],[22, 34],[23, 43],[24, 42],[25, 43],[26, 43],[27, 37]])

export const light_green_alt2_SwitchThumb = n303
const n304 = t([[12, 41],[13, 39],[14, 38],[15, 37],[16, 42],[17, 43],[18, 36],[19, 37],[20, 36],[21, 37],[22, 37],[23, 38],[24, 37],[25, 38],[26, 38],[27, 42]])

export const light_green_alt2_SliderTrackActive = n304
const n305 = t([[12, 43],[13, 42],[14, 41],[15, 39],[16, 44],[17, 45],[18, 36],[19, 37],[20, 36],[21, 37],[22, 35],[23, 41],[24, 39],[25, 41],[26, 41],[27, 39]])

export const light_green_alt2_SliderThumb = n305
export const light_green_alt2_Tooltip = n305
export const light_green_alt2_ProgressIndicator = n305
const n306 = t([[12, 36],[13, 37],[14, 38],[15, 39],[16, 35],[17, 34],[18, 44],[19, 43],[20, 44],[21, 43],[22, 11],[23, 41],[24, 42],[25, 41],[26, 41],[27, 42]])

export const light_green_alt2_Input = n306
export const light_green_alt2_TextArea = n306
const n307 = t([[12, 37],[13, 38],[14, 39],[15, 41],[16, 36],[17, 35],[19, 42],[20, 43],[21, 42],[22, 45],[23, 39],[24, 41],[25, 39],[26, 39],[27, 41]])

export const light_green_active_ListItem = n307
const n308 = t([[12, 39],[13, 41],[14, 42],[15, 43],[16, 38],[17, 37],[19, 42],[20, 43],[21, 42],[22, 43],[23, 42],[24, 43],[25, 42],[26, 42],[27, 38]])

export const light_green_active_Card = n308
export const light_green_active_DrawerFrame = n308
export const light_green_active_Progress = n308
export const light_green_active_TooltipArrow = n308
const n309 = t([[12, 41],[13, 42],[14, 43],[15, 44],[16, 39],[17, 38],[19, 42],[20, 43],[21, 42],[22, 42],[23, 239],[24, 239],[25, 43],[26, 43],[27, 37]])

export const light_green_active_Button = n309
const n310 = t([[12, 41],[13, 42],[14, 43],[15, 44],[16, 39],[17, 38],[19, 42],[20, 43],[21, 42],[22, 42],[23, 43],[24, 44],[25, 43],[26, 43],[27, 37]])

export const light_green_active_Checkbox = n310
export const light_green_active_Switch = n310
export const light_green_active_TooltipContent = n310
export const light_green_active_SliderTrack = n310
const n311 = t([[12, 44],[13, 43],[14, 42],[15, 41],[16, 45],[17, 11],[19, 38],[20, 37],[21, 38],[22, 34],[23, 42],[24, 41],[25, 42],[26, 42],[27, 38]])

export const light_green_active_SwitchThumb = n311
const n312 = t([[12, 39],[13, 38],[14, 37],[15, 36],[16, 41],[17, 42],[19, 38],[20, 37],[21, 38],[22, 38],[23, 37],[24, 36],[25, 37],[26, 37],[27, 43]])

export const light_green_active_SliderTrackActive = n312
const n313 = t([[12, 42],[13, 41],[14, 39],[15, 38],[16, 43],[17, 44],[19, 38],[20, 37],[21, 38],[22, 36],[23, 39],[24, 38],[25, 39],[26, 39],[27, 41]])

export const light_green_active_SliderThumb = n313
export const light_green_active_Tooltip = n313
export const light_green_active_ProgressIndicator = n313
const n314 = t([[12, 37],[13, 38],[14, 39],[15, 41],[16, 36],[17, 35],[19, 42],[20, 43],[21, 42],[22, 45],[23, 42],[24, 43],[25, 42],[26, 42],[27, 41]])

export const light_green_active_Input = n314
export const light_green_active_TextArea = n314
const n315 = t([[12, 15],[13, 16],[14, 17],[15, 18],[16, 14],[17, 14],[18, 25],[19, 24],[20, 25],[21, 24],[22, 11],[23, 17],[24, 18],[25, 17],[26, 17],[27, 23]])

export const light_blue_alt1_ListItem = n315
const n316 = t([[12, 17],[13, 18],[14, 19],[15, 21],[16, 16],[17, 15],[18, 25],[19, 24],[20, 25],[21, 24],[22, 25],[23, 19],[24, 21],[25, 19],[26, 19],[27, 21]])

export const light_blue_alt1_Card = n316
export const light_blue_alt1_DrawerFrame = n316
export const light_blue_alt1_Progress = n316
export const light_blue_alt1_TooltipArrow = n316
const n317 = t([[12, 18],[13, 19],[14, 21],[15, 22],[16, 17],[17, 16],[18, 25],[19, 24],[20, 25],[21, 24],[22, 24],[23, 239],[24, 239],[25, 21],[26, 21],[27, 19]])

export const light_blue_alt1_Button = n317
const n318 = t([[12, 18],[13, 19],[14, 21],[15, 22],[16, 17],[17, 16],[18, 25],[19, 24],[20, 25],[21, 24],[22, 24],[23, 21],[24, 22],[25, 21],[26, 21],[27, 19]])

export const light_blue_alt1_Checkbox = n318
export const light_blue_alt1_Switch = n318
export const light_blue_alt1_TooltipContent = n318
export const light_blue_alt1_SliderTrack = n318
const n319 = t([[12, 11],[13, 25],[14, 24],[15, 23],[16, 11],[17, 11],[18, 15],[19, 16],[20, 15],[21, 16],[22, 14],[23, 24],[24, 23],[25, 24],[26, 24],[27, 16]])

export const light_blue_alt1_SwitchThumb = n319
const n320 = t([[12, 22],[13, 21],[14, 19],[15, 18],[16, 23],[17, 24],[18, 15],[19, 16],[20, 15],[21, 16],[22, 16],[23, 19],[24, 18],[25, 19],[26, 19],[27, 21]])

export const light_blue_alt1_SliderTrackActive = n320
const n321 = t([[12, 24],[13, 23],[14, 22],[15, 21],[16, 25],[17, 11],[18, 15],[19, 16],[20, 15],[21, 16],[22, 14],[23, 22],[24, 21],[25, 22],[26, 22],[27, 18]])

export const light_blue_alt1_SliderThumb = n321
export const light_blue_alt1_Tooltip = n321
export const light_blue_alt1_ProgressIndicator = n321
const n322 = t([[12, 15],[13, 16],[14, 17],[15, 18],[16, 14],[17, 14],[18, 25],[19, 24],[20, 25],[21, 24],[22, 11],[23, 19],[24, 21],[25, 19],[26, 19],[27, 23]])

export const light_blue_alt1_Input = n322
export const light_blue_alt1_TextArea = n322
const n323 = t([[12, 16],[13, 17],[14, 18],[15, 19],[16, 15],[17, 14],[18, 24],[19, 23],[20, 24],[21, 23],[22, 11],[23, 18],[24, 19],[25, 18],[26, 18],[27, 22]])

export const light_blue_alt2_ListItem = n323
const n324 = t([[12, 18],[13, 19],[14, 21],[15, 22],[16, 17],[17, 16],[18, 24],[19, 23],[20, 24],[21, 23],[22, 24],[23, 21],[24, 22],[25, 21],[26, 21],[27, 19]])

export const light_blue_alt2_Card = n324
export const light_blue_alt2_DrawerFrame = n324
export const light_blue_alt2_Progress = n324
export const light_blue_alt2_TooltipArrow = n324
const n325 = t([[12, 19],[13, 21],[14, 22],[15, 23],[16, 18],[17, 17],[18, 24],[19, 23],[20, 24],[21, 23],[22, 23],[23, 239],[24, 239],[25, 22],[26, 22],[27, 18]])

export const light_blue_alt2_Button = n325
const n326 = t([[12, 19],[13, 21],[14, 22],[15, 23],[16, 18],[17, 17],[18, 24],[19, 23],[20, 24],[21, 23],[22, 23],[23, 22],[24, 23],[25, 22],[26, 22],[27, 18]])

export const light_blue_alt2_Checkbox = n326
export const light_blue_alt2_Switch = n326
export const light_blue_alt2_TooltipContent = n326
export const light_blue_alt2_SliderTrack = n326
const n327 = t([[12, 25],[13, 24],[14, 23],[15, 22],[16, 11],[17, 11],[18, 16],[19, 17],[20, 16],[21, 17],[22, 14],[23, 23],[24, 22],[25, 23],[26, 23],[27, 17]])

export const light_blue_alt2_SwitchThumb = n327
const n328 = t([[12, 21],[13, 19],[14, 18],[15, 17],[16, 22],[17, 23],[18, 16],[19, 17],[20, 16],[21, 17],[22, 17],[23, 18],[24, 17],[25, 18],[26, 18],[27, 22]])

export const light_blue_alt2_SliderTrackActive = n328
const n329 = t([[12, 23],[13, 22],[14, 21],[15, 19],[16, 24],[17, 25],[18, 16],[19, 17],[20, 16],[21, 17],[22, 15],[23, 21],[24, 19],[25, 21],[26, 21],[27, 19]])

export const light_blue_alt2_SliderThumb = n329
export const light_blue_alt2_Tooltip = n329
export const light_blue_alt2_ProgressIndicator = n329
const n330 = t([[12, 16],[13, 17],[14, 18],[15, 19],[16, 15],[17, 14],[18, 24],[19, 23],[20, 24],[21, 23],[22, 11],[23, 21],[24, 22],[25, 21],[26, 21],[27, 22]])

export const light_blue_alt2_Input = n330
export const light_blue_alt2_TextArea = n330
const n331 = t([[12, 17],[13, 18],[14, 19],[15, 21],[16, 16],[17, 15],[19, 22],[20, 23],[21, 22],[22, 25],[23, 19],[24, 21],[25, 19],[26, 19],[27, 21]])

export const light_blue_active_ListItem = n331
const n332 = t([[12, 19],[13, 21],[14, 22],[15, 23],[16, 18],[17, 17],[19, 22],[20, 23],[21, 22],[22, 23],[23, 22],[24, 23],[25, 22],[26, 22],[27, 18]])

export const light_blue_active_Card = n332
export const light_blue_active_DrawerFrame = n332
export const light_blue_active_Progress = n332
export const light_blue_active_TooltipArrow = n332
const n333 = t([[12, 21],[13, 22],[14, 23],[15, 24],[16, 19],[17, 18],[19, 22],[20, 23],[21, 22],[22, 22],[23, 239],[24, 239],[25, 23],[26, 23],[27, 17]])

export const light_blue_active_Button = n333
const n334 = t([[12, 21],[13, 22],[14, 23],[15, 24],[16, 19],[17, 18],[19, 22],[20, 23],[21, 22],[22, 22],[23, 23],[24, 24],[25, 23],[26, 23],[27, 17]])

export const light_blue_active_Checkbox = n334
export const light_blue_active_Switch = n334
export const light_blue_active_TooltipContent = n334
export const light_blue_active_SliderTrack = n334
const n335 = t([[12, 24],[13, 23],[14, 22],[15, 21],[16, 25],[17, 11],[19, 18],[20, 17],[21, 18],[22, 14],[23, 22],[24, 21],[25, 22],[26, 22],[27, 18]])

export const light_blue_active_SwitchThumb = n335
const n336 = t([[12, 19],[13, 18],[14, 17],[15, 16],[16, 21],[17, 22],[19, 18],[20, 17],[21, 18],[22, 18],[23, 17],[24, 16],[25, 17],[26, 17],[27, 23]])

export const light_blue_active_SliderTrackActive = n336
const n337 = t([[12, 22],[13, 21],[14, 19],[15, 18],[16, 23],[17, 24],[19, 18],[20, 17],[21, 18],[22, 16],[23, 19],[24, 18],[25, 19],[26, 19],[27, 21]])

export const light_blue_active_SliderThumb = n337
export const light_blue_active_Tooltip = n337
export const light_blue_active_ProgressIndicator = n337
const n338 = t([[12, 17],[13, 18],[14, 19],[15, 21],[16, 16],[17, 15],[19, 22],[20, 23],[21, 22],[22, 25],[23, 22],[24, 23],[25, 22],[26, 22],[27, 21]])

export const light_blue_active_Input = n338
export const light_blue_active_TextArea = n338
const n339 = t([[12, 71],[13, 72],[14, 73],[15, 74],[16, 70],[17, 70],[18, 81],[19, 80],[20, 81],[21, 80],[22, 11],[23, 73],[24, 74],[25, 73],[26, 73],[27, 79]])

export const light_purple_alt1_ListItem = n339
const n340 = t([[12, 73],[13, 74],[14, 75],[15, 77],[16, 72],[17, 71],[18, 81],[19, 80],[20, 81],[21, 80],[22, 81],[23, 75],[24, 77],[25, 75],[26, 75],[27, 77]])

export const light_purple_alt1_Card = n340
export const light_purple_alt1_DrawerFrame = n340
export const light_purple_alt1_Progress = n340
export const light_purple_alt1_TooltipArrow = n340
const n341 = t([[12, 74],[13, 75],[14, 77],[15, 78],[16, 73],[17, 72],[18, 81],[19, 80],[20, 81],[21, 80],[22, 80],[23, 239],[24, 239],[25, 77],[26, 77],[27, 75]])

export const light_purple_alt1_Button = n341
const n342 = t([[12, 74],[13, 75],[14, 77],[15, 78],[16, 73],[17, 72],[18, 81],[19, 80],[20, 81],[21, 80],[22, 80],[23, 77],[24, 78],[25, 77],[26, 77],[27, 75]])

export const light_purple_alt1_Checkbox = n342
export const light_purple_alt1_Switch = n342
export const light_purple_alt1_TooltipContent = n342
export const light_purple_alt1_SliderTrack = n342
const n343 = t([[12, 11],[13, 81],[14, 80],[15, 79],[16, 11],[17, 11],[18, 71],[19, 72],[20, 71],[21, 72],[22, 70],[23, 80],[24, 79],[25, 80],[26, 80],[27, 72]])

export const light_purple_alt1_SwitchThumb = n343
const n344 = t([[12, 78],[13, 77],[14, 75],[15, 74],[16, 79],[17, 80],[18, 71],[19, 72],[20, 71],[21, 72],[22, 72],[23, 75],[24, 74],[25, 75],[26, 75],[27, 77]])

export const light_purple_alt1_SliderTrackActive = n344
const n345 = t([[12, 80],[13, 79],[14, 78],[15, 77],[16, 81],[17, 11],[18, 71],[19, 72],[20, 71],[21, 72],[22, 70],[23, 78],[24, 77],[25, 78],[26, 78],[27, 74]])

export const light_purple_alt1_SliderThumb = n345
export const light_purple_alt1_Tooltip = n345
export const light_purple_alt1_ProgressIndicator = n345
const n346 = t([[12, 71],[13, 72],[14, 73],[15, 74],[16, 70],[17, 70],[18, 81],[19, 80],[20, 81],[21, 80],[22, 11],[23, 75],[24, 77],[25, 75],[26, 75],[27, 79]])

export const light_purple_alt1_Input = n346
export const light_purple_alt1_TextArea = n346
const n347 = t([[12, 72],[13, 73],[14, 74],[15, 75],[16, 71],[17, 70],[18, 80],[19, 79],[20, 80],[21, 79],[22, 11],[23, 74],[24, 75],[25, 74],[26, 74],[27, 78]])

export const light_purple_alt2_ListItem = n347
const n348 = t([[12, 74],[13, 75],[14, 77],[15, 78],[16, 73],[17, 72],[18, 80],[19, 79],[20, 80],[21, 79],[22, 80],[23, 77],[24, 78],[25, 77],[26, 77],[27, 75]])

export const light_purple_alt2_Card = n348
export const light_purple_alt2_DrawerFrame = n348
export const light_purple_alt2_Progress = n348
export const light_purple_alt2_TooltipArrow = n348
const n349 = t([[12, 75],[13, 77],[14, 78],[15, 79],[16, 74],[17, 73],[18, 80],[19, 79],[20, 80],[21, 79],[22, 79],[23, 239],[24, 239],[25, 78],[26, 78],[27, 74]])

export const light_purple_alt2_Button = n349
const n350 = t([[12, 75],[13, 77],[14, 78],[15, 79],[16, 74],[17, 73],[18, 80],[19, 79],[20, 80],[21, 79],[22, 79],[23, 78],[24, 79],[25, 78],[26, 78],[27, 74]])

export const light_purple_alt2_Checkbox = n350
export const light_purple_alt2_Switch = n350
export const light_purple_alt2_TooltipContent = n350
export const light_purple_alt2_SliderTrack = n350
const n351 = t([[12, 81],[13, 80],[14, 79],[15, 78],[16, 11],[17, 11],[18, 72],[19, 73],[20, 72],[21, 73],[22, 70],[23, 79],[24, 78],[25, 79],[26, 79],[27, 73]])

export const light_purple_alt2_SwitchThumb = n351
const n352 = t([[12, 77],[13, 75],[14, 74],[15, 73],[16, 78],[17, 79],[18, 72],[19, 73],[20, 72],[21, 73],[22, 73],[23, 74],[24, 73],[25, 74],[26, 74],[27, 78]])

export const light_purple_alt2_SliderTrackActive = n352
const n353 = t([[12, 79],[13, 78],[14, 77],[15, 75],[16, 80],[17, 81],[18, 72],[19, 73],[20, 72],[21, 73],[22, 71],[23, 77],[24, 75],[25, 77],[26, 77],[27, 75]])

export const light_purple_alt2_SliderThumb = n353
export const light_purple_alt2_Tooltip = n353
export const light_purple_alt2_ProgressIndicator = n353
const n354 = t([[12, 72],[13, 73],[14, 74],[15, 75],[16, 71],[17, 70],[18, 80],[19, 79],[20, 80],[21, 79],[22, 11],[23, 77],[24, 78],[25, 77],[26, 77],[27, 78]])

export const light_purple_alt2_Input = n354
export const light_purple_alt2_TextArea = n354
const n355 = t([[12, 73],[13, 74],[14, 75],[15, 77],[16, 72],[17, 71],[19, 78],[20, 79],[21, 78],[22, 81],[23, 75],[24, 77],[25, 75],[26, 75],[27, 77]])

export const light_purple_active_ListItem = n355
const n356 = t([[12, 75],[13, 77],[14, 78],[15, 79],[16, 74],[17, 73],[19, 78],[20, 79],[21, 78],[22, 79],[23, 78],[24, 79],[25, 78],[26, 78],[27, 74]])

export const light_purple_active_Card = n356
export const light_purple_active_DrawerFrame = n356
export const light_purple_active_Progress = n356
export const light_purple_active_TooltipArrow = n356
const n357 = t([[12, 77],[13, 78],[14, 79],[15, 80],[16, 75],[17, 74],[19, 78],[20, 79],[21, 78],[22, 78],[23, 239],[24, 239],[25, 79],[26, 79],[27, 73]])

export const light_purple_active_Button = n357
const n358 = t([[12, 77],[13, 78],[14, 79],[15, 80],[16, 75],[17, 74],[19, 78],[20, 79],[21, 78],[22, 78],[23, 79],[24, 80],[25, 79],[26, 79],[27, 73]])

export const light_purple_active_Checkbox = n358
export const light_purple_active_Switch = n358
export const light_purple_active_TooltipContent = n358
export const light_purple_active_SliderTrack = n358
const n359 = t([[12, 80],[13, 79],[14, 78],[15, 77],[16, 81],[17, 11],[19, 74],[20, 73],[21, 74],[22, 70],[23, 78],[24, 77],[25, 78],[26, 78],[27, 74]])

export const light_purple_active_SwitchThumb = n359
const n360 = t([[12, 75],[13, 74],[14, 73],[15, 72],[16, 77],[17, 78],[19, 74],[20, 73],[21, 74],[22, 74],[23, 73],[24, 72],[25, 73],[26, 73],[27, 79]])

export const light_purple_active_SliderTrackActive = n360
const n361 = t([[12, 78],[13, 77],[14, 75],[15, 74],[16, 79],[17, 80],[19, 74],[20, 73],[21, 74],[22, 72],[23, 75],[24, 74],[25, 75],[26, 75],[27, 77]])

export const light_purple_active_SliderThumb = n361
export const light_purple_active_Tooltip = n361
export const light_purple_active_ProgressIndicator = n361
const n362 = t([[12, 73],[13, 74],[14, 75],[15, 77],[16, 72],[17, 71],[19, 78],[20, 79],[21, 78],[22, 81],[23, 78],[24, 79],[25, 78],[26, 78],[27, 77]])

export const light_purple_active_Input = n362
export const light_purple_active_TextArea = n362
const n363 = t([[12, 59],[13, 60],[14, 61],[15, 62],[16, 58],[17, 58],[18, 69],[19, 68],[20, 69],[21, 68],[22, 11],[23, 61],[24, 62],[25, 61],[26, 61],[27, 67]])

export const light_pink_alt1_ListItem = n363
const n364 = t([[12, 61],[13, 62],[14, 63],[15, 65],[16, 60],[17, 59],[18, 69],[19, 68],[20, 69],[21, 68],[22, 69],[23, 63],[24, 65],[25, 63],[26, 63],[27, 65]])

export const light_pink_alt1_Card = n364
export const light_pink_alt1_DrawerFrame = n364
export const light_pink_alt1_Progress = n364
export const light_pink_alt1_TooltipArrow = n364
const n365 = t([[12, 62],[13, 63],[14, 65],[15, 66],[16, 61],[17, 60],[18, 69],[19, 68],[20, 69],[21, 68],[22, 68],[23, 239],[24, 239],[25, 65],[26, 65],[27, 63]])

export const light_pink_alt1_Button = n365
const n366 = t([[12, 62],[13, 63],[14, 65],[15, 66],[16, 61],[17, 60],[18, 69],[19, 68],[20, 69],[21, 68],[22, 68],[23, 65],[24, 66],[25, 65],[26, 65],[27, 63]])

export const light_pink_alt1_Checkbox = n366
export const light_pink_alt1_Switch = n366
export const light_pink_alt1_TooltipContent = n366
export const light_pink_alt1_SliderTrack = n366
const n367 = t([[12, 11],[13, 69],[14, 68],[15, 67],[16, 11],[17, 11],[18, 59],[19, 60],[20, 59],[21, 60],[22, 58],[23, 68],[24, 67],[25, 68],[26, 68],[27, 60]])

export const light_pink_alt1_SwitchThumb = n367
const n368 = t([[12, 66],[13, 65],[14, 63],[15, 62],[16, 67],[17, 68],[18, 59],[19, 60],[20, 59],[21, 60],[22, 60],[23, 63],[24, 62],[25, 63],[26, 63],[27, 65]])

export const light_pink_alt1_SliderTrackActive = n368
const n369 = t([[12, 68],[13, 67],[14, 66],[15, 65],[16, 69],[17, 11],[18, 59],[19, 60],[20, 59],[21, 60],[22, 58],[23, 66],[24, 65],[25, 66],[26, 66],[27, 62]])

export const light_pink_alt1_SliderThumb = n369
export const light_pink_alt1_Tooltip = n369
export const light_pink_alt1_ProgressIndicator = n369
const n370 = t([[12, 59],[13, 60],[14, 61],[15, 62],[16, 58],[17, 58],[18, 69],[19, 68],[20, 69],[21, 68],[22, 11],[23, 63],[24, 65],[25, 63],[26, 63],[27, 67]])

export const light_pink_alt1_Input = n370
export const light_pink_alt1_TextArea = n370
const n371 = t([[12, 60],[13, 61],[14, 62],[15, 63],[16, 59],[17, 58],[18, 68],[19, 67],[20, 68],[21, 67],[22, 11],[23, 62],[24, 63],[25, 62],[26, 62],[27, 66]])

export const light_pink_alt2_ListItem = n371
const n372 = t([[12, 62],[13, 63],[14, 65],[15, 66],[16, 61],[17, 60],[18, 68],[19, 67],[20, 68],[21, 67],[22, 68],[23, 65],[24, 66],[25, 65],[26, 65],[27, 63]])

export const light_pink_alt2_Card = n372
export const light_pink_alt2_DrawerFrame = n372
export const light_pink_alt2_Progress = n372
export const light_pink_alt2_TooltipArrow = n372
const n373 = t([[12, 63],[13, 65],[14, 66],[15, 67],[16, 62],[17, 61],[18, 68],[19, 67],[20, 68],[21, 67],[22, 67],[23, 239],[24, 239],[25, 66],[26, 66],[27, 62]])

export const light_pink_alt2_Button = n373
const n374 = t([[12, 63],[13, 65],[14, 66],[15, 67],[16, 62],[17, 61],[18, 68],[19, 67],[20, 68],[21, 67],[22, 67],[23, 66],[24, 67],[25, 66],[26, 66],[27, 62]])

export const light_pink_alt2_Checkbox = n374
export const light_pink_alt2_Switch = n374
export const light_pink_alt2_TooltipContent = n374
export const light_pink_alt2_SliderTrack = n374
const n375 = t([[12, 69],[13, 68],[14, 67],[15, 66],[16, 11],[17, 11],[18, 60],[19, 61],[20, 60],[21, 61],[22, 58],[23, 67],[24, 66],[25, 67],[26, 67],[27, 61]])

export const light_pink_alt2_SwitchThumb = n375
const n376 = t([[12, 65],[13, 63],[14, 62],[15, 61],[16, 66],[17, 67],[18, 60],[19, 61],[20, 60],[21, 61],[22, 61],[23, 62],[24, 61],[25, 62],[26, 62],[27, 66]])

export const light_pink_alt2_SliderTrackActive = n376
const n377 = t([[12, 67],[13, 66],[14, 65],[15, 63],[16, 68],[17, 69],[18, 60],[19, 61],[20, 60],[21, 61],[22, 59],[23, 65],[24, 63],[25, 65],[26, 65],[27, 63]])

export const light_pink_alt2_SliderThumb = n377
export const light_pink_alt2_Tooltip = n377
export const light_pink_alt2_ProgressIndicator = n377
const n378 = t([[12, 60],[13, 61],[14, 62],[15, 63],[16, 59],[17, 58],[18, 68],[19, 67],[20, 68],[21, 67],[22, 11],[23, 65],[24, 66],[25, 65],[26, 65],[27, 66]])

export const light_pink_alt2_Input = n378
export const light_pink_alt2_TextArea = n378
const n379 = t([[12, 61],[13, 62],[14, 63],[15, 65],[16, 60],[17, 59],[19, 66],[20, 67],[21, 66],[22, 69],[23, 63],[24, 65],[25, 63],[26, 63],[27, 65]])

export const light_pink_active_ListItem = n379
const n380 = t([[12, 63],[13, 65],[14, 66],[15, 67],[16, 62],[17, 61],[19, 66],[20, 67],[21, 66],[22, 67],[23, 66],[24, 67],[25, 66],[26, 66],[27, 62]])

export const light_pink_active_Card = n380
export const light_pink_active_DrawerFrame = n380
export const light_pink_active_Progress = n380
export const light_pink_active_TooltipArrow = n380
const n381 = t([[12, 65],[13, 66],[14, 67],[15, 68],[16, 63],[17, 62],[19, 66],[20, 67],[21, 66],[22, 66],[23, 239],[24, 239],[25, 67],[26, 67],[27, 61]])

export const light_pink_active_Button = n381
const n382 = t([[12, 65],[13, 66],[14, 67],[15, 68],[16, 63],[17, 62],[19, 66],[20, 67],[21, 66],[22, 66],[23, 67],[24, 68],[25, 67],[26, 67],[27, 61]])

export const light_pink_active_Checkbox = n382
export const light_pink_active_Switch = n382
export const light_pink_active_TooltipContent = n382
export const light_pink_active_SliderTrack = n382
const n383 = t([[12, 68],[13, 67],[14, 66],[15, 65],[16, 69],[17, 11],[19, 62],[20, 61],[21, 62],[22, 58],[23, 66],[24, 65],[25, 66],[26, 66],[27, 62]])

export const light_pink_active_SwitchThumb = n383
const n384 = t([[12, 63],[13, 62],[14, 61],[15, 60],[16, 65],[17, 66],[19, 62],[20, 61],[21, 62],[22, 62],[23, 61],[24, 60],[25, 61],[26, 61],[27, 67]])

export const light_pink_active_SliderTrackActive = n384
const n385 = t([[12, 66],[13, 65],[14, 63],[15, 62],[16, 67],[17, 68],[19, 62],[20, 61],[21, 62],[22, 60],[23, 63],[24, 62],[25, 63],[26, 63],[27, 65]])

export const light_pink_active_SliderThumb = n385
export const light_pink_active_Tooltip = n385
export const light_pink_active_ProgressIndicator = n385
const n386 = t([[12, 61],[13, 62],[14, 63],[15, 65],[16, 60],[17, 59],[19, 66],[20, 67],[21, 66],[22, 69],[23, 66],[24, 67],[25, 66],[26, 66],[27, 65]])

export const light_pink_active_Input = n386
export const light_pink_active_TextArea = n386
const n387 = t([[12, 83],[13, 84],[14, 85],[15, 86],[16, 82],[17, 82],[18, 93],[19, 92],[20, 93],[21, 92],[22, 11],[23, 85],[24, 86],[25, 85],[26, 85],[27, 91]])

export const light_red_alt1_ListItem = n387
export const light_accent_alt1_ListItem = n387
const n388 = t([[12, 85],[13, 86],[14, 87],[15, 89],[16, 84],[17, 83],[18, 93],[19, 92],[20, 93],[21, 92],[22, 93],[23, 87],[24, 89],[25, 87],[26, 87],[27, 89]])

export const light_red_alt1_Card = n388
export const light_red_alt1_DrawerFrame = n388
export const light_red_alt1_Progress = n388
export const light_red_alt1_TooltipArrow = n388
export const light_accent_alt1_Card = n388
export const light_accent_alt1_DrawerFrame = n388
export const light_accent_alt1_Progress = n388
export const light_accent_alt1_TooltipArrow = n388
const n389 = t([[12, 86],[13, 87],[14, 89],[15, 90],[16, 85],[17, 84],[18, 93],[19, 92],[20, 93],[21, 92],[22, 92],[23, 239],[24, 239],[25, 89],[26, 89],[27, 87]])

export const light_red_alt1_Button = n389
export const light_accent_alt1_Button = n389
const n390 = t([[12, 86],[13, 87],[14, 89],[15, 90],[16, 85],[17, 84],[18, 93],[19, 92],[20, 93],[21, 92],[22, 92],[23, 89],[24, 90],[25, 89],[26, 89],[27, 87]])

export const light_red_alt1_Checkbox = n390
export const light_red_alt1_Switch = n390
export const light_red_alt1_TooltipContent = n390
export const light_red_alt1_SliderTrack = n390
export const light_accent_alt1_Checkbox = n390
export const light_accent_alt1_Switch = n390
export const light_accent_alt1_TooltipContent = n390
export const light_accent_alt1_SliderTrack = n390
const n391 = t([[12, 11],[13, 93],[14, 92],[15, 91],[16, 11],[17, 11],[18, 83],[19, 84],[20, 83],[21, 84],[22, 82],[23, 92],[24, 91],[25, 92],[26, 92],[27, 84]])

export const light_red_alt1_SwitchThumb = n391
export const light_accent_alt1_SwitchThumb = n391
const n392 = t([[12, 90],[13, 89],[14, 87],[15, 86],[16, 91],[17, 92],[18, 83],[19, 84],[20, 83],[21, 84],[22, 84],[23, 87],[24, 86],[25, 87],[26, 87],[27, 89]])

export const light_red_alt1_SliderTrackActive = n392
export const light_accent_alt1_SliderTrackActive = n392
const n393 = t([[12, 92],[13, 91],[14, 90],[15, 89],[16, 93],[17, 11],[18, 83],[19, 84],[20, 83],[21, 84],[22, 82],[23, 90],[24, 89],[25, 90],[26, 90],[27, 86]])

export const light_red_alt1_SliderThumb = n393
export const light_red_alt1_Tooltip = n393
export const light_red_alt1_ProgressIndicator = n393
export const light_accent_alt1_SliderThumb = n393
export const light_accent_alt1_Tooltip = n393
export const light_accent_alt1_ProgressIndicator = n393
const n394 = t([[12, 83],[13, 84],[14, 85],[15, 86],[16, 82],[17, 82],[18, 93],[19, 92],[20, 93],[21, 92],[22, 11],[23, 87],[24, 89],[25, 87],[26, 87],[27, 91]])

export const light_red_alt1_Input = n394
export const light_red_alt1_TextArea = n394
export const light_accent_alt1_Input = n394
export const light_accent_alt1_TextArea = n394
const n395 = t([[12, 84],[13, 85],[14, 86],[15, 87],[16, 83],[17, 82],[18, 92],[19, 91],[20, 92],[21, 91],[22, 11],[23, 86],[24, 87],[25, 86],[26, 86],[27, 90]])

export const light_red_alt2_ListItem = n395
export const light_accent_alt2_ListItem = n395
const n396 = t([[12, 86],[13, 87],[14, 89],[15, 90],[16, 85],[17, 84],[18, 92],[19, 91],[20, 92],[21, 91],[22, 92],[23, 89],[24, 90],[25, 89],[26, 89],[27, 87]])

export const light_red_alt2_Card = n396
export const light_red_alt2_DrawerFrame = n396
export const light_red_alt2_Progress = n396
export const light_red_alt2_TooltipArrow = n396
export const light_accent_alt2_Card = n396
export const light_accent_alt2_DrawerFrame = n396
export const light_accent_alt2_Progress = n396
export const light_accent_alt2_TooltipArrow = n396
const n397 = t([[12, 87],[13, 89],[14, 90],[15, 91],[16, 86],[17, 85],[18, 92],[19, 91],[20, 92],[21, 91],[22, 91],[23, 239],[24, 239],[25, 90],[26, 90],[27, 86]])

export const light_red_alt2_Button = n397
export const light_accent_alt2_Button = n397
const n398 = t([[12, 87],[13, 89],[14, 90],[15, 91],[16, 86],[17, 85],[18, 92],[19, 91],[20, 92],[21, 91],[22, 91],[23, 90],[24, 91],[25, 90],[26, 90],[27, 86]])

export const light_red_alt2_Checkbox = n398
export const light_red_alt2_Switch = n398
export const light_red_alt2_TooltipContent = n398
export const light_red_alt2_SliderTrack = n398
export const light_accent_alt2_Checkbox = n398
export const light_accent_alt2_Switch = n398
export const light_accent_alt2_TooltipContent = n398
export const light_accent_alt2_SliderTrack = n398
const n399 = t([[12, 93],[13, 92],[14, 91],[15, 90],[16, 11],[17, 11],[18, 84],[19, 85],[20, 84],[21, 85],[22, 82],[23, 91],[24, 90],[25, 91],[26, 91],[27, 85]])

export const light_red_alt2_SwitchThumb = n399
export const light_accent_alt2_SwitchThumb = n399
const n400 = t([[12, 89],[13, 87],[14, 86],[15, 85],[16, 90],[17, 91],[18, 84],[19, 85],[20, 84],[21, 85],[22, 85],[23, 86],[24, 85],[25, 86],[26, 86],[27, 90]])

export const light_red_alt2_SliderTrackActive = n400
export const light_accent_alt2_SliderTrackActive = n400
const n401 = t([[12, 91],[13, 90],[14, 89],[15, 87],[16, 92],[17, 93],[18, 84],[19, 85],[20, 84],[21, 85],[22, 83],[23, 89],[24, 87],[25, 89],[26, 89],[27, 87]])

export const light_red_alt2_SliderThumb = n401
export const light_red_alt2_Tooltip = n401
export const light_red_alt2_ProgressIndicator = n401
export const light_accent_alt2_SliderThumb = n401
export const light_accent_alt2_Tooltip = n401
export const light_accent_alt2_ProgressIndicator = n401
const n402 = t([[12, 84],[13, 85],[14, 86],[15, 87],[16, 83],[17, 82],[18, 92],[19, 91],[20, 92],[21, 91],[22, 11],[23, 89],[24, 90],[25, 89],[26, 89],[27, 90]])

export const light_red_alt2_Input = n402
export const light_red_alt2_TextArea = n402
export const light_accent_alt2_Input = n402
export const light_accent_alt2_TextArea = n402
const n403 = t([[12, 85],[13, 86],[14, 87],[15, 89],[16, 84],[17, 83],[19, 90],[20, 91],[21, 90],[22, 93],[23, 87],[24, 89],[25, 87],[26, 87],[27, 89]])

export const light_red_active_ListItem = n403
export const light_accent_active_ListItem = n403
const n404 = t([[12, 87],[13, 89],[14, 90],[15, 91],[16, 86],[17, 85],[19, 90],[20, 91],[21, 90],[22, 91],[23, 90],[24, 91],[25, 90],[26, 90],[27, 86]])

export const light_red_active_Card = n404
export const light_red_active_DrawerFrame = n404
export const light_red_active_Progress = n404
export const light_red_active_TooltipArrow = n404
export const light_accent_active_Card = n404
export const light_accent_active_DrawerFrame = n404
export const light_accent_active_Progress = n404
export const light_accent_active_TooltipArrow = n404
const n405 = t([[12, 89],[13, 90],[14, 91],[15, 92],[16, 87],[17, 86],[19, 90],[20, 91],[21, 90],[22, 90],[23, 239],[24, 239],[25, 91],[26, 91],[27, 85]])

export const light_red_active_Button = n405
export const light_accent_active_Button = n405
const n406 = t([[12, 89],[13, 90],[14, 91],[15, 92],[16, 87],[17, 86],[19, 90],[20, 91],[21, 90],[22, 90],[23, 91],[24, 92],[25, 91],[26, 91],[27, 85]])

export const light_red_active_Checkbox = n406
export const light_red_active_Switch = n406
export const light_red_active_TooltipContent = n406
export const light_red_active_SliderTrack = n406
export const light_accent_active_Checkbox = n406
export const light_accent_active_Switch = n406
export const light_accent_active_TooltipContent = n406
export const light_accent_active_SliderTrack = n406
const n407 = t([[12, 92],[13, 91],[14, 90],[15, 89],[16, 93],[17, 11],[19, 86],[20, 85],[21, 86],[22, 82],[23, 90],[24, 89],[25, 90],[26, 90],[27, 86]])

export const light_red_active_SwitchThumb = n407
export const light_accent_active_SwitchThumb = n407
const n408 = t([[12, 87],[13, 86],[14, 85],[15, 84],[16, 89],[17, 90],[19, 86],[20, 85],[21, 86],[22, 86],[23, 85],[24, 84],[25, 85],[26, 85],[27, 91]])

export const light_red_active_SliderTrackActive = n408
export const light_accent_active_SliderTrackActive = n408
const n409 = t([[12, 90],[13, 89],[14, 87],[15, 86],[16, 91],[17, 92],[19, 86],[20, 85],[21, 86],[22, 84],[23, 87],[24, 86],[25, 87],[26, 87],[27, 89]])

export const light_red_active_SliderThumb = n409
export const light_red_active_Tooltip = n409
export const light_red_active_ProgressIndicator = n409
export const light_accent_active_SliderThumb = n409
export const light_accent_active_Tooltip = n409
export const light_accent_active_ProgressIndicator = n409
const n410 = t([[12, 85],[13, 86],[14, 87],[15, 89],[16, 84],[17, 83],[19, 90],[20, 91],[21, 90],[22, 93],[23, 90],[24, 91],[25, 90],[26, 90],[27, 89]])

export const light_red_active_Input = n410
export const light_red_active_TextArea = n410
export const light_accent_active_Input = n410
export const light_accent_active_TextArea = n410
const n411 = t([[12, 154],[13, 155],[14, 156],[15, 157],[16, 153],[17, 152],[18, 162],[19, 161],[20, 162],[21, 161],[22, 0],[23, 157],[24, 159],[25, 156],[26, 157],[27, 54]])

export const dark_orange_alt1_ListItem = n411
const n412 = t([[12, 155],[13, 156],[14, 157],[15, 159],[16, 154],[17, 153],[18, 162],[19, 161],[20, 162],[21, 161],[22, 162],[23, 159],[24, 54],[25, 157],[26, 159],[27, 159]])

export const dark_orange_alt1_Card = n412
export const dark_orange_alt1_DrawerFrame = n412
export const dark_orange_alt1_Progress = n412
export const dark_orange_alt1_TooltipArrow = n412
const n413 = t([[12, 156],[13, 157],[14, 159],[15, 54],[16, 155],[17, 154],[18, 162],[19, 161],[20, 162],[21, 161],[22, 161],[23, 239],[24, 239],[25, 159],[26, 54],[27, 157]])

export const dark_orange_alt1_Button = n413
const n414 = t([[12, 156],[13, 157],[14, 159],[15, 54],[16, 155],[17, 154],[18, 162],[19, 161],[20, 162],[21, 161],[22, 161],[23, 54],[24, 160],[25, 159],[26, 54],[27, 157]])

export const dark_orange_alt1_Checkbox = n414
export const dark_orange_alt1_Switch = n414
export const dark_orange_alt1_TooltipContent = n414
export const dark_orange_alt1_SliderTrack = n414
const n415 = t([[12, 0],[13, 162],[14, 161],[15, 160],[16, 0],[17, 0],[18, 153],[19, 154],[20, 153],[21, 154],[22, 152],[23, 160],[24, 54],[25, 161],[26, 160],[27, 154]])

export const dark_orange_alt1_SwitchThumb = n415
const n416 = t([[12, 54],[13, 159],[14, 157],[15, 156],[16, 160],[17, 161],[18, 153],[19, 154],[20, 153],[21, 154],[22, 154],[23, 156],[24, 155],[25, 157],[26, 156],[27, 159]])

export const dark_orange_alt1_SliderTrackActive = n416
const n417 = t([[12, 161],[13, 160],[14, 54],[15, 159],[16, 162],[17, 0],[18, 153],[19, 154],[20, 153],[21, 154],[22, 152],[23, 159],[24, 157],[25, 54],[26, 159],[27, 156]])

export const dark_orange_alt1_SliderThumb = n417
export const dark_orange_alt1_Tooltip = n417
export const dark_orange_alt1_ProgressIndicator = n417
const n418 = t([[12, 154],[13, 155],[14, 156],[15, 157],[16, 153],[17, 152],[18, 162],[19, 161],[20, 162],[21, 161],[22, 0],[23, 159],[24, 54],[25, 157],[26, 159],[27, 54]])

export const dark_orange_alt1_Input = n418
export const dark_orange_alt1_TextArea = n418
const n419 = t([[12, 155],[13, 156],[14, 157],[15, 159],[16, 154],[17, 153],[18, 161],[19, 160],[20, 161],[21, 160],[22, 162],[23, 159],[24, 54],[25, 157],[26, 159],[27, 159]])

export const dark_orange_alt2_ListItem = n419
const n420 = t([[12, 156],[13, 157],[14, 159],[15, 54],[16, 155],[17, 154],[18, 161],[19, 160],[20, 161],[21, 160],[22, 161],[23, 54],[24, 160],[25, 159],[26, 54],[27, 157]])

export const dark_orange_alt2_Card = n420
export const dark_orange_alt2_DrawerFrame = n420
export const dark_orange_alt2_Progress = n420
export const dark_orange_alt2_TooltipArrow = n420
const n421 = t([[12, 157],[13, 159],[14, 54],[15, 160],[16, 156],[17, 155],[18, 161],[19, 160],[20, 161],[21, 160],[22, 160],[23, 239],[24, 239],[25, 54],[26, 160],[27, 156]])

export const dark_orange_alt2_Button = n421
const n422 = t([[12, 157],[13, 159],[14, 54],[15, 160],[16, 156],[17, 155],[18, 161],[19, 160],[20, 161],[21, 160],[22, 160],[23, 160],[24, 161],[25, 54],[26, 160],[27, 156]])

export const dark_orange_alt2_Checkbox = n422
export const dark_orange_alt2_Switch = n422
export const dark_orange_alt2_TooltipContent = n422
export const dark_orange_alt2_SliderTrack = n422
const n423 = t([[12, 162],[13, 161],[14, 160],[15, 54],[16, 0],[17, 0],[18, 154],[19, 155],[20, 154],[21, 155],[22, 152],[23, 54],[24, 159],[25, 160],[26, 54],[27, 155]])

export const dark_orange_alt2_SwitchThumb = n423
const n424 = t([[12, 159],[13, 157],[14, 156],[15, 155],[16, 54],[17, 160],[18, 154],[19, 155],[20, 154],[21, 155],[22, 155],[23, 155],[24, 154],[25, 156],[26, 155],[27, 54]])

export const dark_orange_alt2_SliderTrackActive = n424
const n425 = t([[12, 160],[13, 54],[14, 159],[15, 157],[16, 161],[17, 162],[18, 154],[19, 155],[20, 154],[21, 155],[22, 153],[23, 157],[24, 156],[25, 159],[26, 157],[27, 157]])

export const dark_orange_alt2_SliderThumb = n425
export const dark_orange_alt2_Tooltip = n425
export const dark_orange_alt2_ProgressIndicator = n425
const n426 = t([[12, 155],[13, 156],[14, 157],[15, 159],[16, 154],[17, 153],[18, 161],[19, 160],[20, 161],[21, 160],[22, 162],[23, 54],[24, 160],[25, 159],[26, 54],[27, 159]])

export const dark_orange_alt2_Input = n426
export const dark_orange_alt2_TextArea = n426
const n427 = t([[12, 156],[13, 157],[14, 159],[15, 54],[16, 155],[17, 154],[19, 54],[20, 160],[21, 54],[22, 161],[23, 54],[24, 160],[25, 159],[26, 54],[27, 157]])

export const dark_orange_active_ListItem = n427
const n428 = t([[12, 157],[13, 159],[14, 54],[15, 160],[16, 156],[17, 155],[19, 54],[20, 160],[21, 54],[22, 160],[23, 160],[24, 161],[25, 54],[26, 160],[27, 156]])

export const dark_orange_active_Card = n428
export const dark_orange_active_DrawerFrame = n428
export const dark_orange_active_Progress = n428
export const dark_orange_active_TooltipArrow = n428
const n429 = t([[12, 159],[13, 54],[14, 160],[15, 161],[16, 157],[17, 156],[19, 54],[20, 160],[21, 54],[22, 54],[23, 239],[24, 239],[25, 160],[26, 161],[27, 155]])

export const dark_orange_active_Button = n429
const n430 = t([[12, 159],[13, 54],[14, 160],[15, 161],[16, 157],[17, 156],[19, 54],[20, 160],[21, 54],[22, 54],[23, 161],[24, 162],[25, 160],[26, 161],[27, 155]])

export const dark_orange_active_Checkbox = n430
export const dark_orange_active_Switch = n430
export const dark_orange_active_TooltipContent = n430
export const dark_orange_active_SliderTrack = n430
const n431 = t([[12, 161],[13, 160],[14, 54],[15, 159],[16, 162],[17, 0],[19, 156],[20, 155],[21, 156],[22, 152],[23, 159],[24, 157],[25, 54],[26, 159],[27, 156]])

export const dark_orange_active_SwitchThumb = n431
const n432 = t([[12, 157],[13, 156],[14, 155],[15, 154],[16, 159],[17, 54],[19, 156],[20, 155],[21, 156],[22, 156],[23, 154],[24, 153],[25, 155],[26, 154],[27, 160]])

export const dark_orange_active_SliderTrackActive = n432
const n433 = t([[12, 54],[13, 159],[14, 157],[15, 156],[16, 160],[17, 161],[19, 156],[20, 155],[21, 156],[22, 154],[23, 156],[24, 155],[25, 157],[26, 156],[27, 159]])

export const dark_orange_active_SliderThumb = n433
export const dark_orange_active_Tooltip = n433
export const dark_orange_active_ProgressIndicator = n433
const n434 = t([[12, 156],[13, 157],[14, 159],[15, 54],[16, 155],[17, 154],[19, 54],[20, 160],[21, 54],[22, 161],[23, 160],[24, 161],[25, 54],[26, 160],[27, 157]])

export const dark_orange_active_Input = n434
export const dark_orange_active_TextArea = n434
const n435 = t([[12, 198],[13, 199],[14, 200],[15, 201],[16, 197],[17, 196],[18, 206],[19, 205],[20, 206],[21, 205],[22, 0],[23, 201],[24, 203],[25, 200],[26, 201],[27, 102]])

export const dark_yellow_alt1_ListItem = n435
const n436 = t([[12, 199],[13, 200],[14, 201],[15, 203],[16, 198],[17, 197],[18, 206],[19, 205],[20, 206],[21, 205],[22, 206],[23, 203],[24, 102],[25, 201],[26, 203],[27, 203]])

export const dark_yellow_alt1_Card = n436
export const dark_yellow_alt1_DrawerFrame = n436
export const dark_yellow_alt1_Progress = n436
export const dark_yellow_alt1_TooltipArrow = n436
const n437 = t([[12, 200],[13, 201],[14, 203],[15, 102],[16, 199],[17, 198],[18, 206],[19, 205],[20, 206],[21, 205],[22, 205],[23, 239],[24, 239],[25, 203],[26, 102],[27, 201]])

export const dark_yellow_alt1_Button = n437
const n438 = t([[12, 200],[13, 201],[14, 203],[15, 102],[16, 199],[17, 198],[18, 206],[19, 205],[20, 206],[21, 205],[22, 205],[23, 102],[24, 204],[25, 203],[26, 102],[27, 201]])

export const dark_yellow_alt1_Checkbox = n438
export const dark_yellow_alt1_Switch = n438
export const dark_yellow_alt1_TooltipContent = n438
export const dark_yellow_alt1_SliderTrack = n438
const n439 = t([[12, 0],[13, 206],[14, 205],[15, 204],[16, 0],[17, 0],[18, 197],[19, 198],[20, 197],[21, 198],[22, 196],[23, 204],[24, 102],[25, 205],[26, 204],[27, 198]])

export const dark_yellow_alt1_SwitchThumb = n439
const n440 = t([[12, 102],[13, 203],[14, 201],[15, 200],[16, 204],[17, 205],[18, 197],[19, 198],[20, 197],[21, 198],[22, 198],[23, 200],[24, 199],[25, 201],[26, 200],[27, 203]])

export const dark_yellow_alt1_SliderTrackActive = n440
const n441 = t([[12, 205],[13, 204],[14, 102],[15, 203],[16, 206],[17, 0],[18, 197],[19, 198],[20, 197],[21, 198],[22, 196],[23, 203],[24, 201],[25, 102],[26, 203],[27, 200]])

export const dark_yellow_alt1_SliderThumb = n441
export const dark_yellow_alt1_Tooltip = n441
export const dark_yellow_alt1_ProgressIndicator = n441
const n442 = t([[12, 198],[13, 199],[14, 200],[15, 201],[16, 197],[17, 196],[18, 206],[19, 205],[20, 206],[21, 205],[22, 0],[23, 203],[24, 102],[25, 201],[26, 203],[27, 102]])

export const dark_yellow_alt1_Input = n442
export const dark_yellow_alt1_TextArea = n442
const n443 = t([[12, 199],[13, 200],[14, 201],[15, 203],[16, 198],[17, 197],[18, 205],[19, 204],[20, 205],[21, 204],[22, 206],[23, 203],[24, 102],[25, 201],[26, 203],[27, 203]])

export const dark_yellow_alt2_ListItem = n443
const n444 = t([[12, 200],[13, 201],[14, 203],[15, 102],[16, 199],[17, 198],[18, 205],[19, 204],[20, 205],[21, 204],[22, 205],[23, 102],[24, 204],[25, 203],[26, 102],[27, 201]])

export const dark_yellow_alt2_Card = n444
export const dark_yellow_alt2_DrawerFrame = n444
export const dark_yellow_alt2_Progress = n444
export const dark_yellow_alt2_TooltipArrow = n444
const n445 = t([[12, 201],[13, 203],[14, 102],[15, 204],[16, 200],[17, 199],[18, 205],[19, 204],[20, 205],[21, 204],[22, 204],[23, 239],[24, 239],[25, 102],[26, 204],[27, 200]])

export const dark_yellow_alt2_Button = n445
const n446 = t([[12, 201],[13, 203],[14, 102],[15, 204],[16, 200],[17, 199],[18, 205],[19, 204],[20, 205],[21, 204],[22, 204],[23, 204],[24, 205],[25, 102],[26, 204],[27, 200]])

export const dark_yellow_alt2_Checkbox = n446
export const dark_yellow_alt2_Switch = n446
export const dark_yellow_alt2_TooltipContent = n446
export const dark_yellow_alt2_SliderTrack = n446
const n447 = t([[12, 206],[13, 205],[14, 204],[15, 102],[16, 0],[17, 0],[18, 198],[19, 199],[20, 198],[21, 199],[22, 196],[23, 102],[24, 203],[25, 204],[26, 102],[27, 199]])

export const dark_yellow_alt2_SwitchThumb = n447
const n448 = t([[12, 203],[13, 201],[14, 200],[15, 199],[16, 102],[17, 204],[18, 198],[19, 199],[20, 198],[21, 199],[22, 199],[23, 199],[24, 198],[25, 200],[26, 199],[27, 102]])

export const dark_yellow_alt2_SliderTrackActive = n448
const n449 = t([[12, 204],[13, 102],[14, 203],[15, 201],[16, 205],[17, 206],[18, 198],[19, 199],[20, 198],[21, 199],[22, 197],[23, 201],[24, 200],[25, 203],[26, 201],[27, 201]])

export const dark_yellow_alt2_SliderThumb = n449
export const dark_yellow_alt2_Tooltip = n449
export const dark_yellow_alt2_ProgressIndicator = n449
const n450 = t([[12, 199],[13, 200],[14, 201],[15, 203],[16, 198],[17, 197],[18, 205],[19, 204],[20, 205],[21, 204],[22, 206],[23, 102],[24, 204],[25, 203],[26, 102],[27, 203]])

export const dark_yellow_alt2_Input = n450
export const dark_yellow_alt2_TextArea = n450
const n451 = t([[12, 200],[13, 201],[14, 203],[15, 102],[16, 199],[17, 198],[19, 102],[20, 204],[21, 102],[22, 205],[23, 102],[24, 204],[25, 203],[26, 102],[27, 201]])

export const dark_yellow_active_ListItem = n451
const n452 = t([[12, 201],[13, 203],[14, 102],[15, 204],[16, 200],[17, 199],[19, 102],[20, 204],[21, 102],[22, 204],[23, 204],[24, 205],[25, 102],[26, 204],[27, 200]])

export const dark_yellow_active_Card = n452
export const dark_yellow_active_DrawerFrame = n452
export const dark_yellow_active_Progress = n452
export const dark_yellow_active_TooltipArrow = n452
const n453 = t([[12, 203],[13, 102],[14, 204],[15, 205],[16, 201],[17, 200],[19, 102],[20, 204],[21, 102],[22, 102],[23, 239],[24, 239],[25, 204],[26, 205],[27, 199]])

export const dark_yellow_active_Button = n453
const n454 = t([[12, 203],[13, 102],[14, 204],[15, 205],[16, 201],[17, 200],[19, 102],[20, 204],[21, 102],[22, 102],[23, 205],[24, 206],[25, 204],[26, 205],[27, 199]])

export const dark_yellow_active_Checkbox = n454
export const dark_yellow_active_Switch = n454
export const dark_yellow_active_TooltipContent = n454
export const dark_yellow_active_SliderTrack = n454
const n455 = t([[12, 205],[13, 204],[14, 102],[15, 203],[16, 206],[17, 0],[19, 200],[20, 199],[21, 200],[22, 196],[23, 203],[24, 201],[25, 102],[26, 203],[27, 200]])

export const dark_yellow_active_SwitchThumb = n455
const n456 = t([[12, 201],[13, 200],[14, 199],[15, 198],[16, 203],[17, 102],[19, 200],[20, 199],[21, 200],[22, 200],[23, 198],[24, 197],[25, 199],[26, 198],[27, 204]])

export const dark_yellow_active_SliderTrackActive = n456
const n457 = t([[12, 102],[13, 203],[14, 201],[15, 200],[16, 204],[17, 205],[19, 200],[20, 199],[21, 200],[22, 198],[23, 200],[24, 199],[25, 201],[26, 200],[27, 203]])

export const dark_yellow_active_SliderThumb = n457
export const dark_yellow_active_Tooltip = n457
export const dark_yellow_active_ProgressIndicator = n457
const n458 = t([[12, 200],[13, 201],[14, 203],[15, 102],[16, 199],[17, 198],[19, 102],[20, 204],[21, 102],[22, 205],[23, 204],[24, 205],[25, 102],[26, 204],[27, 201]])

export const dark_yellow_active_Input = n458
export const dark_yellow_active_TextArea = n458
const n459 = t([[12, 143],[13, 144],[14, 145],[15, 146],[16, 142],[17, 141],[18, 151],[19, 150],[20, 151],[21, 150],[22, 0],[23, 146],[24, 148],[25, 145],[26, 146],[27, 42]])

export const dark_green_alt1_ListItem = n459
const n460 = t([[12, 144],[13, 145],[14, 146],[15, 148],[16, 143],[17, 142],[18, 151],[19, 150],[20, 151],[21, 150],[22, 151],[23, 148],[24, 42],[25, 146],[26, 148],[27, 148]])

export const dark_green_alt1_Card = n460
export const dark_green_alt1_DrawerFrame = n460
export const dark_green_alt1_Progress = n460
export const dark_green_alt1_TooltipArrow = n460
const n461 = t([[12, 145],[13, 146],[14, 148],[15, 42],[16, 144],[17, 143],[18, 151],[19, 150],[20, 151],[21, 150],[22, 150],[23, 239],[24, 239],[25, 148],[26, 42],[27, 146]])

export const dark_green_alt1_Button = n461
const n462 = t([[12, 145],[13, 146],[14, 148],[15, 42],[16, 144],[17, 143],[18, 151],[19, 150],[20, 151],[21, 150],[22, 150],[23, 42],[24, 149],[25, 148],[26, 42],[27, 146]])

export const dark_green_alt1_Checkbox = n462
export const dark_green_alt1_Switch = n462
export const dark_green_alt1_TooltipContent = n462
export const dark_green_alt1_SliderTrack = n462
const n463 = t([[12, 0],[13, 151],[14, 150],[15, 149],[16, 0],[17, 0],[18, 142],[19, 143],[20, 142],[21, 143],[22, 141],[23, 149],[24, 42],[25, 150],[26, 149],[27, 143]])

export const dark_green_alt1_SwitchThumb = n463
const n464 = t([[12, 42],[13, 148],[14, 146],[15, 145],[16, 149],[17, 150],[18, 142],[19, 143],[20, 142],[21, 143],[22, 143],[23, 145],[24, 144],[25, 146],[26, 145],[27, 148]])

export const dark_green_alt1_SliderTrackActive = n464
const n465 = t([[12, 150],[13, 149],[14, 42],[15, 148],[16, 151],[17, 0],[18, 142],[19, 143],[20, 142],[21, 143],[22, 141],[23, 148],[24, 146],[25, 42],[26, 148],[27, 145]])

export const dark_green_alt1_SliderThumb = n465
export const dark_green_alt1_Tooltip = n465
export const dark_green_alt1_ProgressIndicator = n465
const n466 = t([[12, 143],[13, 144],[14, 145],[15, 146],[16, 142],[17, 141],[18, 151],[19, 150],[20, 151],[21, 150],[22, 0],[23, 148],[24, 42],[25, 146],[26, 148],[27, 42]])

export const dark_green_alt1_Input = n466
export const dark_green_alt1_TextArea = n466
const n467 = t([[12, 144],[13, 145],[14, 146],[15, 148],[16, 143],[17, 142],[18, 150],[19, 149],[20, 150],[21, 149],[22, 151],[23, 148],[24, 42],[25, 146],[26, 148],[27, 148]])

export const dark_green_alt2_ListItem = n467
const n468 = t([[12, 145],[13, 146],[14, 148],[15, 42],[16, 144],[17, 143],[18, 150],[19, 149],[20, 150],[21, 149],[22, 150],[23, 42],[24, 149],[25, 148],[26, 42],[27, 146]])

export const dark_green_alt2_Card = n468
export const dark_green_alt2_DrawerFrame = n468
export const dark_green_alt2_Progress = n468
export const dark_green_alt2_TooltipArrow = n468
const n469 = t([[12, 146],[13, 148],[14, 42],[15, 149],[16, 145],[17, 144],[18, 150],[19, 149],[20, 150],[21, 149],[22, 149],[23, 239],[24, 239],[25, 42],[26, 149],[27, 145]])

export const dark_green_alt2_Button = n469
const n470 = t([[12, 146],[13, 148],[14, 42],[15, 149],[16, 145],[17, 144],[18, 150],[19, 149],[20, 150],[21, 149],[22, 149],[23, 149],[24, 150],[25, 42],[26, 149],[27, 145]])

export const dark_green_alt2_Checkbox = n470
export const dark_green_alt2_Switch = n470
export const dark_green_alt2_TooltipContent = n470
export const dark_green_alt2_SliderTrack = n470
const n471 = t([[12, 151],[13, 150],[14, 149],[15, 42],[16, 0],[17, 0],[18, 143],[19, 144],[20, 143],[21, 144],[22, 141],[23, 42],[24, 148],[25, 149],[26, 42],[27, 144]])

export const dark_green_alt2_SwitchThumb = n471
const n472 = t([[12, 148],[13, 146],[14, 145],[15, 144],[16, 42],[17, 149],[18, 143],[19, 144],[20, 143],[21, 144],[22, 144],[23, 144],[24, 143],[25, 145],[26, 144],[27, 42]])

export const dark_green_alt2_SliderTrackActive = n472
const n473 = t([[12, 149],[13, 42],[14, 148],[15, 146],[16, 150],[17, 151],[18, 143],[19, 144],[20, 143],[21, 144],[22, 142],[23, 146],[24, 145],[25, 148],[26, 146],[27, 146]])

export const dark_green_alt2_SliderThumb = n473
export const dark_green_alt2_Tooltip = n473
export const dark_green_alt2_ProgressIndicator = n473
const n474 = t([[12, 144],[13, 145],[14, 146],[15, 148],[16, 143],[17, 142],[18, 150],[19, 149],[20, 150],[21, 149],[22, 151],[23, 42],[24, 149],[25, 148],[26, 42],[27, 148]])

export const dark_green_alt2_Input = n474
export const dark_green_alt2_TextArea = n474
const n475 = t([[12, 145],[13, 146],[14, 148],[15, 42],[16, 144],[17, 143],[19, 42],[20, 149],[21, 42],[22, 150],[23, 42],[24, 149],[25, 148],[26, 42],[27, 146]])

export const dark_green_active_ListItem = n475
const n476 = t([[12, 146],[13, 148],[14, 42],[15, 149],[16, 145],[17, 144],[19, 42],[20, 149],[21, 42],[22, 149],[23, 149],[24, 150],[25, 42],[26, 149],[27, 145]])

export const dark_green_active_Card = n476
export const dark_green_active_DrawerFrame = n476
export const dark_green_active_Progress = n476
export const dark_green_active_TooltipArrow = n476
const n477 = t([[12, 148],[13, 42],[14, 149],[15, 150],[16, 146],[17, 145],[19, 42],[20, 149],[21, 42],[22, 42],[23, 239],[24, 239],[25, 149],[26, 150],[27, 144]])

export const dark_green_active_Button = n477
const n478 = t([[12, 148],[13, 42],[14, 149],[15, 150],[16, 146],[17, 145],[19, 42],[20, 149],[21, 42],[22, 42],[23, 150],[24, 151],[25, 149],[26, 150],[27, 144]])

export const dark_green_active_Checkbox = n478
export const dark_green_active_Switch = n478
export const dark_green_active_TooltipContent = n478
export const dark_green_active_SliderTrack = n478
const n479 = t([[12, 150],[13, 149],[14, 42],[15, 148],[16, 151],[17, 0],[19, 145],[20, 144],[21, 145],[22, 141],[23, 148],[24, 146],[25, 42],[26, 148],[27, 145]])

export const dark_green_active_SwitchThumb = n479
const n480 = t([[12, 146],[13, 145],[14, 144],[15, 143],[16, 148],[17, 42],[19, 145],[20, 144],[21, 145],[22, 145],[23, 143],[24, 142],[25, 144],[26, 143],[27, 149]])

export const dark_green_active_SliderTrackActive = n480
const n481 = t([[12, 42],[13, 148],[14, 146],[15, 145],[16, 149],[17, 150],[19, 145],[20, 144],[21, 145],[22, 143],[23, 145],[24, 144],[25, 146],[26, 145],[27, 148]])

export const dark_green_active_SliderThumb = n481
export const dark_green_active_Tooltip = n481
export const dark_green_active_ProgressIndicator = n481
const n482 = t([[12, 145],[13, 146],[14, 148],[15, 42],[16, 144],[17, 143],[19, 42],[20, 149],[21, 42],[22, 150],[23, 149],[24, 150],[25, 42],[26, 149],[27, 146]])

export const dark_green_active_Input = n482
export const dark_green_active_TextArea = n482
const n483 = t([[12, 121],[13, 122],[14, 123],[15, 124],[16, 120],[17, 119],[18, 129],[19, 128],[20, 129],[21, 128],[22, 0],[23, 124],[24, 126],[25, 123],[26, 124],[27, 22]])

export const dark_blue_alt1_ListItem = n483
const n484 = t([[12, 122],[13, 123],[14, 124],[15, 126],[16, 121],[17, 120],[18, 129],[19, 128],[20, 129],[21, 128],[22, 129],[23, 126],[24, 22],[25, 124],[26, 126],[27, 126]])

export const dark_blue_alt1_Card = n484
export const dark_blue_alt1_DrawerFrame = n484
export const dark_blue_alt1_Progress = n484
export const dark_blue_alt1_TooltipArrow = n484
const n485 = t([[12, 123],[13, 124],[14, 126],[15, 22],[16, 122],[17, 121],[18, 129],[19, 128],[20, 129],[21, 128],[22, 128],[23, 239],[24, 239],[25, 126],[26, 22],[27, 124]])

export const dark_blue_alt1_Button = n485
const n486 = t([[12, 123],[13, 124],[14, 126],[15, 22],[16, 122],[17, 121],[18, 129],[19, 128],[20, 129],[21, 128],[22, 128],[23, 22],[24, 127],[25, 126],[26, 22],[27, 124]])

export const dark_blue_alt1_Checkbox = n486
export const dark_blue_alt1_Switch = n486
export const dark_blue_alt1_TooltipContent = n486
export const dark_blue_alt1_SliderTrack = n486
const n487 = t([[12, 0],[13, 129],[14, 128],[15, 127],[16, 0],[17, 0],[18, 120],[19, 121],[20, 120],[21, 121],[22, 119],[23, 127],[24, 22],[25, 128],[26, 127],[27, 121]])

export const dark_blue_alt1_SwitchThumb = n487
const n488 = t([[12, 22],[13, 126],[14, 124],[15, 123],[16, 127],[17, 128],[18, 120],[19, 121],[20, 120],[21, 121],[22, 121],[23, 123],[24, 122],[25, 124],[26, 123],[27, 126]])

export const dark_blue_alt1_SliderTrackActive = n488
const n489 = t([[12, 128],[13, 127],[14, 22],[15, 126],[16, 129],[17, 0],[18, 120],[19, 121],[20, 120],[21, 121],[22, 119],[23, 126],[24, 124],[25, 22],[26, 126],[27, 123]])

export const dark_blue_alt1_SliderThumb = n489
export const dark_blue_alt1_Tooltip = n489
export const dark_blue_alt1_ProgressIndicator = n489
const n490 = t([[12, 121],[13, 122],[14, 123],[15, 124],[16, 120],[17, 119],[18, 129],[19, 128],[20, 129],[21, 128],[22, 0],[23, 126],[24, 22],[25, 124],[26, 126],[27, 22]])

export const dark_blue_alt1_Input = n490
export const dark_blue_alt1_TextArea = n490
const n491 = t([[12, 122],[13, 123],[14, 124],[15, 126],[16, 121],[17, 120],[18, 128],[19, 127],[20, 128],[21, 127],[22, 129],[23, 126],[24, 22],[25, 124],[26, 126],[27, 126]])

export const dark_blue_alt2_ListItem = n491
const n492 = t([[12, 123],[13, 124],[14, 126],[15, 22],[16, 122],[17, 121],[18, 128],[19, 127],[20, 128],[21, 127],[22, 128],[23, 22],[24, 127],[25, 126],[26, 22],[27, 124]])

export const dark_blue_alt2_Card = n492
export const dark_blue_alt2_DrawerFrame = n492
export const dark_blue_alt2_Progress = n492
export const dark_blue_alt2_TooltipArrow = n492
const n493 = t([[12, 124],[13, 126],[14, 22],[15, 127],[16, 123],[17, 122],[18, 128],[19, 127],[20, 128],[21, 127],[22, 127],[23, 239],[24, 239],[25, 22],[26, 127],[27, 123]])

export const dark_blue_alt2_Button = n493
const n494 = t([[12, 124],[13, 126],[14, 22],[15, 127],[16, 123],[17, 122],[18, 128],[19, 127],[20, 128],[21, 127],[22, 127],[23, 127],[24, 128],[25, 22],[26, 127],[27, 123]])

export const dark_blue_alt2_Checkbox = n494
export const dark_blue_alt2_Switch = n494
export const dark_blue_alt2_TooltipContent = n494
export const dark_blue_alt2_SliderTrack = n494
const n495 = t([[12, 129],[13, 128],[14, 127],[15, 22],[16, 0],[17, 0],[18, 121],[19, 122],[20, 121],[21, 122],[22, 119],[23, 22],[24, 126],[25, 127],[26, 22],[27, 122]])

export const dark_blue_alt2_SwitchThumb = n495
const n496 = t([[12, 126],[13, 124],[14, 123],[15, 122],[16, 22],[17, 127],[18, 121],[19, 122],[20, 121],[21, 122],[22, 122],[23, 122],[24, 121],[25, 123],[26, 122],[27, 22]])

export const dark_blue_alt2_SliderTrackActive = n496
const n497 = t([[12, 127],[13, 22],[14, 126],[15, 124],[16, 128],[17, 129],[18, 121],[19, 122],[20, 121],[21, 122],[22, 120],[23, 124],[24, 123],[25, 126],[26, 124],[27, 124]])

export const dark_blue_alt2_SliderThumb = n497
export const dark_blue_alt2_Tooltip = n497
export const dark_blue_alt2_ProgressIndicator = n497
const n498 = t([[12, 122],[13, 123],[14, 124],[15, 126],[16, 121],[17, 120],[18, 128],[19, 127],[20, 128],[21, 127],[22, 129],[23, 22],[24, 127],[25, 126],[26, 22],[27, 126]])

export const dark_blue_alt2_Input = n498
export const dark_blue_alt2_TextArea = n498
const n499 = t([[12, 123],[13, 124],[14, 126],[15, 22],[16, 122],[17, 121],[19, 22],[20, 127],[21, 22],[22, 128],[23, 22],[24, 127],[25, 126],[26, 22],[27, 124]])

export const dark_blue_active_ListItem = n499
const n500 = t([[12, 124],[13, 126],[14, 22],[15, 127],[16, 123],[17, 122],[19, 22],[20, 127],[21, 22],[22, 127],[23, 127],[24, 128],[25, 22],[26, 127],[27, 123]])

export const dark_blue_active_Card = n500
export const dark_blue_active_DrawerFrame = n500
export const dark_blue_active_Progress = n500
export const dark_blue_active_TooltipArrow = n500
const n501 = t([[12, 126],[13, 22],[14, 127],[15, 128],[16, 124],[17, 123],[19, 22],[20, 127],[21, 22],[22, 22],[23, 239],[24, 239],[25, 127],[26, 128],[27, 122]])

export const dark_blue_active_Button = n501
const n502 = t([[12, 126],[13, 22],[14, 127],[15, 128],[16, 124],[17, 123],[19, 22],[20, 127],[21, 22],[22, 22],[23, 128],[24, 129],[25, 127],[26, 128],[27, 122]])

export const dark_blue_active_Checkbox = n502
export const dark_blue_active_Switch = n502
export const dark_blue_active_TooltipContent = n502
export const dark_blue_active_SliderTrack = n502
const n503 = t([[12, 128],[13, 127],[14, 22],[15, 126],[16, 129],[17, 0],[19, 123],[20, 122],[21, 123],[22, 119],[23, 126],[24, 124],[25, 22],[26, 126],[27, 123]])

export const dark_blue_active_SwitchThumb = n503
const n504 = t([[12, 124],[13, 123],[14, 122],[15, 121],[16, 126],[17, 22],[19, 123],[20, 122],[21, 123],[22, 123],[23, 121],[24, 120],[25, 122],[26, 121],[27, 127]])

export const dark_blue_active_SliderTrackActive = n504
const n505 = t([[12, 22],[13, 126],[14, 124],[15, 123],[16, 127],[17, 128],[19, 123],[20, 122],[21, 123],[22, 121],[23, 123],[24, 122],[25, 124],[26, 123],[27, 126]])

export const dark_blue_active_SliderThumb = n505
export const dark_blue_active_Tooltip = n505
export const dark_blue_active_ProgressIndicator = n505
const n506 = t([[12, 123],[13, 124],[14, 126],[15, 22],[16, 122],[17, 121],[19, 22],[20, 127],[21, 22],[22, 128],[23, 127],[24, 128],[25, 22],[26, 127],[27, 124]])

export const dark_blue_active_Input = n506
export const dark_blue_active_TextArea = n506
const n507 = t([[12, 176],[13, 177],[14, 178],[15, 179],[16, 175],[17, 174],[18, 184],[19, 183],[20, 184],[21, 183],[22, 0],[23, 179],[24, 181],[25, 178],[26, 179],[27, 78]])

export const dark_purple_alt1_ListItem = n507
const n508 = t([[12, 177],[13, 178],[14, 179],[15, 181],[16, 176],[17, 175],[18, 184],[19, 183],[20, 184],[21, 183],[22, 184],[23, 181],[24, 78],[25, 179],[26, 181],[27, 181]])

export const dark_purple_alt1_Card = n508
export const dark_purple_alt1_DrawerFrame = n508
export const dark_purple_alt1_Progress = n508
export const dark_purple_alt1_TooltipArrow = n508
const n509 = t([[12, 178],[13, 179],[14, 181],[15, 78],[16, 177],[17, 176],[18, 184],[19, 183],[20, 184],[21, 183],[22, 183],[23, 239],[24, 239],[25, 181],[26, 78],[27, 179]])

export const dark_purple_alt1_Button = n509
const n510 = t([[12, 178],[13, 179],[14, 181],[15, 78],[16, 177],[17, 176],[18, 184],[19, 183],[20, 184],[21, 183],[22, 183],[23, 78],[24, 182],[25, 181],[26, 78],[27, 179]])

export const dark_purple_alt1_Checkbox = n510
export const dark_purple_alt1_Switch = n510
export const dark_purple_alt1_TooltipContent = n510
export const dark_purple_alt1_SliderTrack = n510
const n511 = t([[12, 0],[13, 184],[14, 183],[15, 182],[16, 0],[17, 0],[18, 175],[19, 176],[20, 175],[21, 176],[22, 174],[23, 182],[24, 78],[25, 183],[26, 182],[27, 176]])

export const dark_purple_alt1_SwitchThumb = n511
const n512 = t([[12, 78],[13, 181],[14, 179],[15, 178],[16, 182],[17, 183],[18, 175],[19, 176],[20, 175],[21, 176],[22, 176],[23, 178],[24, 177],[25, 179],[26, 178],[27, 181]])

export const dark_purple_alt1_SliderTrackActive = n512
const n513 = t([[12, 183],[13, 182],[14, 78],[15, 181],[16, 184],[17, 0],[18, 175],[19, 176],[20, 175],[21, 176],[22, 174],[23, 181],[24, 179],[25, 78],[26, 181],[27, 178]])

export const dark_purple_alt1_SliderThumb = n513
export const dark_purple_alt1_Tooltip = n513
export const dark_purple_alt1_ProgressIndicator = n513
const n514 = t([[12, 176],[13, 177],[14, 178],[15, 179],[16, 175],[17, 174],[18, 184],[19, 183],[20, 184],[21, 183],[22, 0],[23, 181],[24, 78],[25, 179],[26, 181],[27, 78]])

export const dark_purple_alt1_Input = n514
export const dark_purple_alt1_TextArea = n514
const n515 = t([[12, 177],[13, 178],[14, 179],[15, 181],[16, 176],[17, 175],[18, 183],[19, 182],[20, 183],[21, 182],[22, 184],[23, 181],[24, 78],[25, 179],[26, 181],[27, 181]])

export const dark_purple_alt2_ListItem = n515
const n516 = t([[12, 178],[13, 179],[14, 181],[15, 78],[16, 177],[17, 176],[18, 183],[19, 182],[20, 183],[21, 182],[22, 183],[23, 78],[24, 182],[25, 181],[26, 78],[27, 179]])

export const dark_purple_alt2_Card = n516
export const dark_purple_alt2_DrawerFrame = n516
export const dark_purple_alt2_Progress = n516
export const dark_purple_alt2_TooltipArrow = n516
const n517 = t([[12, 179],[13, 181],[14, 78],[15, 182],[16, 178],[17, 177],[18, 183],[19, 182],[20, 183],[21, 182],[22, 182],[23, 239],[24, 239],[25, 78],[26, 182],[27, 178]])

export const dark_purple_alt2_Button = n517
const n518 = t([[12, 179],[13, 181],[14, 78],[15, 182],[16, 178],[17, 177],[18, 183],[19, 182],[20, 183],[21, 182],[22, 182],[23, 182],[24, 183],[25, 78],[26, 182],[27, 178]])

export const dark_purple_alt2_Checkbox = n518
export const dark_purple_alt2_Switch = n518
export const dark_purple_alt2_TooltipContent = n518
export const dark_purple_alt2_SliderTrack = n518
const n519 = t([[12, 184],[13, 183],[14, 182],[15, 78],[16, 0],[17, 0],[18, 176],[19, 177],[20, 176],[21, 177],[22, 174],[23, 78],[24, 181],[25, 182],[26, 78],[27, 177]])

export const dark_purple_alt2_SwitchThumb = n519
const n520 = t([[12, 181],[13, 179],[14, 178],[15, 177],[16, 78],[17, 182],[18, 176],[19, 177],[20, 176],[21, 177],[22, 177],[23, 177],[24, 176],[25, 178],[26, 177],[27, 78]])

export const dark_purple_alt2_SliderTrackActive = n520
const n521 = t([[12, 182],[13, 78],[14, 181],[15, 179],[16, 183],[17, 184],[18, 176],[19, 177],[20, 176],[21, 177],[22, 175],[23, 179],[24, 178],[25, 181],[26, 179],[27, 179]])

export const dark_purple_alt2_SliderThumb = n521
export const dark_purple_alt2_Tooltip = n521
export const dark_purple_alt2_ProgressIndicator = n521
const n522 = t([[12, 177],[13, 178],[14, 179],[15, 181],[16, 176],[17, 175],[18, 183],[19, 182],[20, 183],[21, 182],[22, 184],[23, 78],[24, 182],[25, 181],[26, 78],[27, 181]])

export const dark_purple_alt2_Input = n522
export const dark_purple_alt2_TextArea = n522
const n523 = t([[12, 178],[13, 179],[14, 181],[15, 78],[16, 177],[17, 176],[19, 78],[20, 182],[21, 78],[22, 183],[23, 78],[24, 182],[25, 181],[26, 78],[27, 179]])

export const dark_purple_active_ListItem = n523
const n524 = t([[12, 179],[13, 181],[14, 78],[15, 182],[16, 178],[17, 177],[19, 78],[20, 182],[21, 78],[22, 182],[23, 182],[24, 183],[25, 78],[26, 182],[27, 178]])

export const dark_purple_active_Card = n524
export const dark_purple_active_DrawerFrame = n524
export const dark_purple_active_Progress = n524
export const dark_purple_active_TooltipArrow = n524
const n525 = t([[12, 181],[13, 78],[14, 182],[15, 183],[16, 179],[17, 178],[19, 78],[20, 182],[21, 78],[22, 78],[23, 239],[24, 239],[25, 182],[26, 183],[27, 177]])

export const dark_purple_active_Button = n525
const n526 = t([[12, 181],[13, 78],[14, 182],[15, 183],[16, 179],[17, 178],[19, 78],[20, 182],[21, 78],[22, 78],[23, 183],[24, 184],[25, 182],[26, 183],[27, 177]])

export const dark_purple_active_Checkbox = n526
export const dark_purple_active_Switch = n526
export const dark_purple_active_TooltipContent = n526
export const dark_purple_active_SliderTrack = n526
const n527 = t([[12, 183],[13, 182],[14, 78],[15, 181],[16, 184],[17, 0],[19, 178],[20, 177],[21, 178],[22, 174],[23, 181],[24, 179],[25, 78],[26, 181],[27, 178]])

export const dark_purple_active_SwitchThumb = n527
const n528 = t([[12, 179],[13, 178],[14, 177],[15, 176],[16, 181],[17, 78],[19, 178],[20, 177],[21, 178],[22, 178],[23, 176],[24, 175],[25, 177],[26, 176],[27, 182]])

export const dark_purple_active_SliderTrackActive = n528
const n529 = t([[12, 78],[13, 181],[14, 179],[15, 178],[16, 182],[17, 183],[19, 178],[20, 177],[21, 178],[22, 176],[23, 178],[24, 177],[25, 179],[26, 178],[27, 181]])

export const dark_purple_active_SliderThumb = n529
export const dark_purple_active_Tooltip = n529
export const dark_purple_active_ProgressIndicator = n529
const n530 = t([[12, 178],[13, 179],[14, 181],[15, 78],[16, 177],[17, 176],[19, 78],[20, 182],[21, 78],[22, 183],[23, 182],[24, 183],[25, 78],[26, 182],[27, 179]])

export const dark_purple_active_Input = n530
export const dark_purple_active_TextArea = n530
const n531 = t([[12, 165],[13, 166],[14, 167],[15, 168],[16, 164],[17, 163],[18, 173],[19, 172],[20, 173],[21, 172],[22, 0],[23, 168],[24, 170],[25, 167],[26, 168],[27, 66]])

export const dark_pink_alt1_ListItem = n531
const n532 = t([[12, 166],[13, 167],[14, 168],[15, 170],[16, 165],[17, 164],[18, 173],[19, 172],[20, 173],[21, 172],[22, 173],[23, 170],[24, 66],[25, 168],[26, 170],[27, 170]])

export const dark_pink_alt1_Card = n532
export const dark_pink_alt1_DrawerFrame = n532
export const dark_pink_alt1_Progress = n532
export const dark_pink_alt1_TooltipArrow = n532
const n533 = t([[12, 167],[13, 168],[14, 170],[15, 66],[16, 166],[17, 165],[18, 173],[19, 172],[20, 173],[21, 172],[22, 172],[23, 239],[24, 239],[25, 170],[26, 66],[27, 168]])

export const dark_pink_alt1_Button = n533
const n534 = t([[12, 167],[13, 168],[14, 170],[15, 66],[16, 166],[17, 165],[18, 173],[19, 172],[20, 173],[21, 172],[22, 172],[23, 66],[24, 171],[25, 170],[26, 66],[27, 168]])

export const dark_pink_alt1_Checkbox = n534
export const dark_pink_alt1_Switch = n534
export const dark_pink_alt1_TooltipContent = n534
export const dark_pink_alt1_SliderTrack = n534
const n535 = t([[12, 0],[13, 173],[14, 172],[15, 171],[16, 0],[17, 0],[18, 164],[19, 165],[20, 164],[21, 165],[22, 163],[23, 171],[24, 66],[25, 172],[26, 171],[27, 165]])

export const dark_pink_alt1_SwitchThumb = n535
const n536 = t([[12, 66],[13, 170],[14, 168],[15, 167],[16, 171],[17, 172],[18, 164],[19, 165],[20, 164],[21, 165],[22, 165],[23, 167],[24, 166],[25, 168],[26, 167],[27, 170]])

export const dark_pink_alt1_SliderTrackActive = n536
const n537 = t([[12, 172],[13, 171],[14, 66],[15, 170],[16, 173],[17, 0],[18, 164],[19, 165],[20, 164],[21, 165],[22, 163],[23, 170],[24, 168],[25, 66],[26, 170],[27, 167]])

export const dark_pink_alt1_SliderThumb = n537
export const dark_pink_alt1_Tooltip = n537
export const dark_pink_alt1_ProgressIndicator = n537
const n538 = t([[12, 165],[13, 166],[14, 167],[15, 168],[16, 164],[17, 163],[18, 173],[19, 172],[20, 173],[21, 172],[22, 0],[23, 170],[24, 66],[25, 168],[26, 170],[27, 66]])

export const dark_pink_alt1_Input = n538
export const dark_pink_alt1_TextArea = n538
const n539 = t([[12, 166],[13, 167],[14, 168],[15, 170],[16, 165],[17, 164],[18, 172],[19, 171],[20, 172],[21, 171],[22, 173],[23, 170],[24, 66],[25, 168],[26, 170],[27, 170]])

export const dark_pink_alt2_ListItem = n539
const n540 = t([[12, 167],[13, 168],[14, 170],[15, 66],[16, 166],[17, 165],[18, 172],[19, 171],[20, 172],[21, 171],[22, 172],[23, 66],[24, 171],[25, 170],[26, 66],[27, 168]])

export const dark_pink_alt2_Card = n540
export const dark_pink_alt2_DrawerFrame = n540
export const dark_pink_alt2_Progress = n540
export const dark_pink_alt2_TooltipArrow = n540
const n541 = t([[12, 168],[13, 170],[14, 66],[15, 171],[16, 167],[17, 166],[18, 172],[19, 171],[20, 172],[21, 171],[22, 171],[23, 239],[24, 239],[25, 66],[26, 171],[27, 167]])

export const dark_pink_alt2_Button = n541
const n542 = t([[12, 168],[13, 170],[14, 66],[15, 171],[16, 167],[17, 166],[18, 172],[19, 171],[20, 172],[21, 171],[22, 171],[23, 171],[24, 172],[25, 66],[26, 171],[27, 167]])

export const dark_pink_alt2_Checkbox = n542
export const dark_pink_alt2_Switch = n542
export const dark_pink_alt2_TooltipContent = n542
export const dark_pink_alt2_SliderTrack = n542
const n543 = t([[12, 173],[13, 172],[14, 171],[15, 66],[16, 0],[17, 0],[18, 165],[19, 166],[20, 165],[21, 166],[22, 163],[23, 66],[24, 170],[25, 171],[26, 66],[27, 166]])

export const dark_pink_alt2_SwitchThumb = n543
const n544 = t([[12, 170],[13, 168],[14, 167],[15, 166],[16, 66],[17, 171],[18, 165],[19, 166],[20, 165],[21, 166],[22, 166],[23, 166],[24, 165],[25, 167],[26, 166],[27, 66]])

export const dark_pink_alt2_SliderTrackActive = n544
const n545 = t([[12, 171],[13, 66],[14, 170],[15, 168],[16, 172],[17, 173],[18, 165],[19, 166],[20, 165],[21, 166],[22, 164],[23, 168],[24, 167],[25, 170],[26, 168],[27, 168]])

export const dark_pink_alt2_SliderThumb = n545
export const dark_pink_alt2_Tooltip = n545
export const dark_pink_alt2_ProgressIndicator = n545
const n546 = t([[12, 166],[13, 167],[14, 168],[15, 170],[16, 165],[17, 164],[18, 172],[19, 171],[20, 172],[21, 171],[22, 173],[23, 66],[24, 171],[25, 170],[26, 66],[27, 170]])

export const dark_pink_alt2_Input = n546
export const dark_pink_alt2_TextArea = n546
const n547 = t([[12, 167],[13, 168],[14, 170],[15, 66],[16, 166],[17, 165],[19, 66],[20, 171],[21, 66],[22, 172],[23, 66],[24, 171],[25, 170],[26, 66],[27, 168]])

export const dark_pink_active_ListItem = n547
const n548 = t([[12, 168],[13, 170],[14, 66],[15, 171],[16, 167],[17, 166],[19, 66],[20, 171],[21, 66],[22, 171],[23, 171],[24, 172],[25, 66],[26, 171],[27, 167]])

export const dark_pink_active_Card = n548
export const dark_pink_active_DrawerFrame = n548
export const dark_pink_active_Progress = n548
export const dark_pink_active_TooltipArrow = n548
const n549 = t([[12, 170],[13, 66],[14, 171],[15, 172],[16, 168],[17, 167],[19, 66],[20, 171],[21, 66],[22, 66],[23, 239],[24, 239],[25, 171],[26, 172],[27, 166]])

export const dark_pink_active_Button = n549
const n550 = t([[12, 170],[13, 66],[14, 171],[15, 172],[16, 168],[17, 167],[19, 66],[20, 171],[21, 66],[22, 66],[23, 172],[24, 173],[25, 171],[26, 172],[27, 166]])

export const dark_pink_active_Checkbox = n550
export const dark_pink_active_Switch = n550
export const dark_pink_active_TooltipContent = n550
export const dark_pink_active_SliderTrack = n550
const n551 = t([[12, 172],[13, 171],[14, 66],[15, 170],[16, 173],[17, 0],[19, 167],[20, 166],[21, 167],[22, 163],[23, 170],[24, 168],[25, 66],[26, 170],[27, 167]])

export const dark_pink_active_SwitchThumb = n551
const n552 = t([[12, 168],[13, 167],[14, 166],[15, 165],[16, 170],[17, 66],[19, 167],[20, 166],[21, 167],[22, 167],[23, 165],[24, 164],[25, 166],[26, 165],[27, 171]])

export const dark_pink_active_SliderTrackActive = n552
const n553 = t([[12, 66],[13, 170],[14, 168],[15, 167],[16, 171],[17, 172],[19, 167],[20, 166],[21, 167],[22, 165],[23, 167],[24, 166],[25, 168],[26, 167],[27, 170]])

export const dark_pink_active_SliderThumb = n553
export const dark_pink_active_Tooltip = n553
export const dark_pink_active_ProgressIndicator = n553
const n554 = t([[12, 167],[13, 168],[14, 170],[15, 66],[16, 166],[17, 165],[19, 66],[20, 171],[21, 66],[22, 172],[23, 171],[24, 172],[25, 66],[26, 171],[27, 168]])

export const dark_pink_active_Input = n554
export const dark_pink_active_TextArea = n554
const n555 = t([[12, 187],[13, 188],[14, 189],[15, 190],[16, 186],[17, 185],[18, 195],[19, 194],[20, 195],[21, 194],[22, 0],[23, 190],[24, 192],[25, 189],[26, 190],[27, 90]])

export const dark_red_alt1_ListItem = n555
export const dark_accent_alt1_ListItem = n555
const n556 = t([[12, 188],[13, 189],[14, 190],[15, 192],[16, 187],[17, 186],[18, 195],[19, 194],[20, 195],[21, 194],[22, 195],[23, 192],[24, 90],[25, 190],[26, 192],[27, 192]])

export const dark_red_alt1_Card = n556
export const dark_red_alt1_DrawerFrame = n556
export const dark_red_alt1_Progress = n556
export const dark_red_alt1_TooltipArrow = n556
export const dark_accent_alt1_Card = n556
export const dark_accent_alt1_DrawerFrame = n556
export const dark_accent_alt1_Progress = n556
export const dark_accent_alt1_TooltipArrow = n556
const n557 = t([[12, 189],[13, 190],[14, 192],[15, 90],[16, 188],[17, 187],[18, 195],[19, 194],[20, 195],[21, 194],[22, 194],[23, 239],[24, 239],[25, 192],[26, 90],[27, 190]])

export const dark_red_alt1_Button = n557
export const dark_accent_alt1_Button = n557
const n558 = t([[12, 189],[13, 190],[14, 192],[15, 90],[16, 188],[17, 187],[18, 195],[19, 194],[20, 195],[21, 194],[22, 194],[23, 90],[24, 193],[25, 192],[26, 90],[27, 190]])

export const dark_red_alt1_Checkbox = n558
export const dark_red_alt1_Switch = n558
export const dark_red_alt1_TooltipContent = n558
export const dark_red_alt1_SliderTrack = n558
export const dark_accent_alt1_Checkbox = n558
export const dark_accent_alt1_Switch = n558
export const dark_accent_alt1_TooltipContent = n558
export const dark_accent_alt1_SliderTrack = n558
const n559 = t([[12, 0],[13, 195],[14, 194],[15, 193],[16, 0],[17, 0],[18, 186],[19, 187],[20, 186],[21, 187],[22, 185],[23, 193],[24, 90],[25, 194],[26, 193],[27, 187]])

export const dark_red_alt1_SwitchThumb = n559
export const dark_accent_alt1_SwitchThumb = n559
const n560 = t([[12, 90],[13, 192],[14, 190],[15, 189],[16, 193],[17, 194],[18, 186],[19, 187],[20, 186],[21, 187],[22, 187],[23, 189],[24, 188],[25, 190],[26, 189],[27, 192]])

export const dark_red_alt1_SliderTrackActive = n560
export const dark_accent_alt1_SliderTrackActive = n560
const n561 = t([[12, 194],[13, 193],[14, 90],[15, 192],[16, 195],[17, 0],[18, 186],[19, 187],[20, 186],[21, 187],[22, 185],[23, 192],[24, 190],[25, 90],[26, 192],[27, 189]])

export const dark_red_alt1_SliderThumb = n561
export const dark_red_alt1_Tooltip = n561
export const dark_red_alt1_ProgressIndicator = n561
export const dark_accent_alt1_SliderThumb = n561
export const dark_accent_alt1_Tooltip = n561
export const dark_accent_alt1_ProgressIndicator = n561
const n562 = t([[12, 187],[13, 188],[14, 189],[15, 190],[16, 186],[17, 185],[18, 195],[19, 194],[20, 195],[21, 194],[22, 0],[23, 192],[24, 90],[25, 190],[26, 192],[27, 90]])

export const dark_red_alt1_Input = n562
export const dark_red_alt1_TextArea = n562
export const dark_accent_alt1_Input = n562
export const dark_accent_alt1_TextArea = n562
const n563 = t([[12, 188],[13, 189],[14, 190],[15, 192],[16, 187],[17, 186],[18, 194],[19, 193],[20, 194],[21, 193],[22, 195],[23, 192],[24, 90],[25, 190],[26, 192],[27, 192]])

export const dark_red_alt2_ListItem = n563
export const dark_accent_alt2_ListItem = n563
const n564 = t([[12, 189],[13, 190],[14, 192],[15, 90],[16, 188],[17, 187],[18, 194],[19, 193],[20, 194],[21, 193],[22, 194],[23, 90],[24, 193],[25, 192],[26, 90],[27, 190]])

export const dark_red_alt2_Card = n564
export const dark_red_alt2_DrawerFrame = n564
export const dark_red_alt2_Progress = n564
export const dark_red_alt2_TooltipArrow = n564
export const dark_accent_alt2_Card = n564
export const dark_accent_alt2_DrawerFrame = n564
export const dark_accent_alt2_Progress = n564
export const dark_accent_alt2_TooltipArrow = n564
const n565 = t([[12, 190],[13, 192],[14, 90],[15, 193],[16, 189],[17, 188],[18, 194],[19, 193],[20, 194],[21, 193],[22, 193],[23, 239],[24, 239],[25, 90],[26, 193],[27, 189]])

export const dark_red_alt2_Button = n565
export const dark_accent_alt2_Button = n565
const n566 = t([[12, 190],[13, 192],[14, 90],[15, 193],[16, 189],[17, 188],[18, 194],[19, 193],[20, 194],[21, 193],[22, 193],[23, 193],[24, 194],[25, 90],[26, 193],[27, 189]])

export const dark_red_alt2_Checkbox = n566
export const dark_red_alt2_Switch = n566
export const dark_red_alt2_TooltipContent = n566
export const dark_red_alt2_SliderTrack = n566
export const dark_accent_alt2_Checkbox = n566
export const dark_accent_alt2_Switch = n566
export const dark_accent_alt2_TooltipContent = n566
export const dark_accent_alt2_SliderTrack = n566
const n567 = t([[12, 195],[13, 194],[14, 193],[15, 90],[16, 0],[17, 0],[18, 187],[19, 188],[20, 187],[21, 188],[22, 185],[23, 90],[24, 192],[25, 193],[26, 90],[27, 188]])

export const dark_red_alt2_SwitchThumb = n567
export const dark_accent_alt2_SwitchThumb = n567
const n568 = t([[12, 192],[13, 190],[14, 189],[15, 188],[16, 90],[17, 193],[18, 187],[19, 188],[20, 187],[21, 188],[22, 188],[23, 188],[24, 187],[25, 189],[26, 188],[27, 90]])

export const dark_red_alt2_SliderTrackActive = n568
export const dark_accent_alt2_SliderTrackActive = n568
const n569 = t([[12, 193],[13, 90],[14, 192],[15, 190],[16, 194],[17, 195],[18, 187],[19, 188],[20, 187],[21, 188],[22, 186],[23, 190],[24, 189],[25, 192],[26, 190],[27, 190]])

export const dark_red_alt2_SliderThumb = n569
export const dark_red_alt2_Tooltip = n569
export const dark_red_alt2_ProgressIndicator = n569
export const dark_accent_alt2_SliderThumb = n569
export const dark_accent_alt2_Tooltip = n569
export const dark_accent_alt2_ProgressIndicator = n569
const n570 = t([[12, 188],[13, 189],[14, 190],[15, 192],[16, 187],[17, 186],[18, 194],[19, 193],[20, 194],[21, 193],[22, 195],[23, 90],[24, 193],[25, 192],[26, 90],[27, 192]])

export const dark_red_alt2_Input = n570
export const dark_red_alt2_TextArea = n570
export const dark_accent_alt2_Input = n570
export const dark_accent_alt2_TextArea = n570
const n571 = t([[12, 189],[13, 190],[14, 192],[15, 90],[16, 188],[17, 187],[19, 90],[20, 193],[21, 90],[22, 194],[23, 90],[24, 193],[25, 192],[26, 90],[27, 190]])

export const dark_red_active_ListItem = n571
export const dark_accent_active_ListItem = n571
const n572 = t([[12, 190],[13, 192],[14, 90],[15, 193],[16, 189],[17, 188],[19, 90],[20, 193],[21, 90],[22, 193],[23, 193],[24, 194],[25, 90],[26, 193],[27, 189]])

export const dark_red_active_Card = n572
export const dark_red_active_DrawerFrame = n572
export const dark_red_active_Progress = n572
export const dark_red_active_TooltipArrow = n572
export const dark_accent_active_Card = n572
export const dark_accent_active_DrawerFrame = n572
export const dark_accent_active_Progress = n572
export const dark_accent_active_TooltipArrow = n572
const n573 = t([[12, 192],[13, 90],[14, 193],[15, 194],[16, 190],[17, 189],[19, 90],[20, 193],[21, 90],[22, 90],[23, 239],[24, 239],[25, 193],[26, 194],[27, 188]])

export const dark_red_active_Button = n573
export const dark_accent_active_Button = n573
const n574 = t([[12, 192],[13, 90],[14, 193],[15, 194],[16, 190],[17, 189],[19, 90],[20, 193],[21, 90],[22, 90],[23, 194],[24, 195],[25, 193],[26, 194],[27, 188]])

export const dark_red_active_Checkbox = n574
export const dark_red_active_Switch = n574
export const dark_red_active_TooltipContent = n574
export const dark_red_active_SliderTrack = n574
export const dark_accent_active_Checkbox = n574
export const dark_accent_active_Switch = n574
export const dark_accent_active_TooltipContent = n574
export const dark_accent_active_SliderTrack = n574
const n575 = t([[12, 194],[13, 193],[14, 90],[15, 192],[16, 195],[17, 0],[19, 189],[20, 188],[21, 189],[22, 185],[23, 192],[24, 190],[25, 90],[26, 192],[27, 189]])

export const dark_red_active_SwitchThumb = n575
export const dark_accent_active_SwitchThumb = n575
const n576 = t([[12, 190],[13, 189],[14, 188],[15, 187],[16, 192],[17, 90],[19, 189],[20, 188],[21, 189],[22, 189],[23, 187],[24, 186],[25, 188],[26, 187],[27, 193]])

export const dark_red_active_SliderTrackActive = n576
export const dark_accent_active_SliderTrackActive = n576
const n577 = t([[12, 90],[13, 192],[14, 190],[15, 189],[16, 193],[17, 194],[19, 189],[20, 188],[21, 189],[22, 187],[23, 189],[24, 188],[25, 190],[26, 189],[27, 192]])

export const dark_red_active_SliderThumb = n577
export const dark_red_active_Tooltip = n577
export const dark_red_active_ProgressIndicator = n577
export const dark_accent_active_SliderThumb = n577
export const dark_accent_active_Tooltip = n577
export const dark_accent_active_ProgressIndicator = n577
const n578 = t([[12, 189],[13, 190],[14, 192],[15, 90],[16, 188],[17, 187],[19, 90],[20, 193],[21, 90],[22, 194],[23, 193],[24, 194],[25, 90],[26, 193],[27, 190]])

export const dark_red_active_Input = n578
export const dark_red_active_TextArea = n578
export const dark_accent_active_Input = n578
export const dark_accent_active_TextArea = n578
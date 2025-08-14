// import React from 'react';
// import { Gem, Trophy, Award, Medal } from 'lucide-react';

// interface RankCardProps {
//     points: number;
// }

// const RankCard: React.FC<RankCardProps> = ({ points }) => {
//     const getRankDetails = (p: number) => {
//         if (p >= 10000) return { name: 'Kim Cương', color: 'bg-sky-500', icon: Gem };
//         if (p >= 5000) return { name: 'Vàng', color: 'bg-amber-500', icon: Trophy };
//         if (p >= 1000) return { name: 'Bạc', color: 'bg-slate-500', icon: Award };
//         return { name: 'Đồng', color: 'bg-orange-500', icon: Medal };
//     };
//     const rank = getRankDetails(points);
//     const RankIcon = rank.icon;

//     return (
//         <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl p-5 flex justify-between items-center shadow-lg">
//             <div className="flex items-center gap-4">
//                 <div className={`w-12 h-12 rounded-full flex items-center justify-center ${rank.color}`}><RankIcon size={24} /></div>
//                 <div>
//                     <p className="text-xs font-semibold opacity-70 uppercase">Hạng thành viên</p>
//                     <p className="font-bold text-lg">{rank.name}</p>
//                 </div>
//             </div>
//             <div className="text-right">
//                 <p className="font-bold text-2xl">{points.toLocaleString()}</p>
//                 <p className="text-xs font-semibold opacity-70">Điểm thưởng</p>
//             </div>
//         </div>
//     );
// };

// export default RankCard;
// // Component để hiển thị thẻ hạng thành viên với điểm thưởng và biểu tượng tương ứng
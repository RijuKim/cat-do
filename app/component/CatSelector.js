// components/CatSelector.js
import Image from 'next/image';

const cats = [
  {name: '두두', personality: '새침한 츤데레', img: '/cats/dudu.png'},
  {name: '코코', personality: '다정한 개냥이', img: '/cats/coco.png'},
  {name: '깜냥', personality: '불친절한 고양이', img: '/cats/kkamnyang.png'},
];

export default function CatSelector({selectedCat, onSelectCat}) {
  return (
    <div className="fixed top-4 right-4 flex gap-4 p-4 bg-white rounded-full shadow">
      {cats.map(cat => (
        <button
          key={cat.name}
          onClick={() => onSelectCat(cat.name)}
          className={`flex flex-col items-center ${
            selectedCat === cat.name ? 'ring-2 ring-yellow-400' : ''
          }`}>
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image src={cat.img} alt={cat.name} width={48} height={48} />
          </div>
          <span className="text-xs mt-1">{cat.name}</span>
          <span className="text-[10px] text-gray-500">{cat.personality}</span>
        </button>
      ))}
    </div>
  );
}

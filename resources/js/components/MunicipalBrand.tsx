import { talibonAssets } from '../branding/talibonAssets';

type Props = { inverse?: boolean; compact?: boolean; publicPortal?: boolean };

export default function MunicipalBrand({ inverse = false, compact = false, publicPortal = false }: Props) {
    return <div className={`municipal-brand flex min-w-0 items-center gap-3 ${inverse ? 'text-white' : 'text-[#0b2852] dark:text-slate-100'}`}>
        <img src={talibonAssets.municipalSeal} alt="Municipal identity placeholder" className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
        <div className="min-w-0">
            <div className={`whitespace-nowrap font-extrabold leading-tight tracking-tight ${compact ? 'text-xl' : 'text-xl sm:text-2xl'}`}>
                <span className={inverse ? 'text-white' : 'text-[#2f7d45] dark:text-[#8ec9a0]'}>ONE</span> TALIBON
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase leading-snug tracking-wider">{publicPortal ? 'Digital Portal' : 'LGU Intra-Office Portal'}</div>
        </div>
    </div>;
}

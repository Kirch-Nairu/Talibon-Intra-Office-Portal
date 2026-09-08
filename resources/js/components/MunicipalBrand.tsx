import { talibonAssets } from '../branding/talibonAssets';

type Props = { inverse?: boolean; compact?: boolean; publicPortal?: boolean };

export default function MunicipalBrand({ inverse = false, compact = false, publicPortal = false }: Props) {
    return (
        <div className={`flex min-w-0 items-center gap-3 ${inverse ? 'text-white' : 'text-[#0b2852] dark:text-slate-100'}`}>
            <img src={talibonAssets.municipalSeal} alt="Municipal identity placeholder" className={compact ? 'h-12 w-12 shrink-0' : 'h-16 w-16 shrink-0 sm:h-20 sm:w-20'} />
            <div className="min-w-0">
                {compact ? <>
                    <div className="text-[9px] uppercase tracking-wider opacity-80">Municipality of</div>
                    <div className="text-xl font-extrabold tracking-wide">TALIBON</div>
                    <div className="text-[10px] opacity-80">Province of Bohol</div>
                </> : <>
                    <div className="whitespace-nowrap text-2xl font-black tracking-tight sm:text-4xl"><span className={inverse ? 'text-lime-300' : 'text-[#348638] dark:text-green-400'}>ONE</span> TALIBON</div>
                    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.27em] sm:text-sm">{publicPortal ? 'Digital Portal' : 'LGU Intra-Office Portal'}</div>
                    <div className="mt-1 text-[10px] opacity-80 sm:text-xs">Municipality of Talibon, Bohol</div>
                </>}
            </div>
        </div>
    );
}

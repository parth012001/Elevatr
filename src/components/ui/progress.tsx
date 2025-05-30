import * as ProgressPrimitive from '@radix-ui/react-progress'
import { HTMLAttributes } from 'react'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  className?: string
}

export function Progress({ value, className = '', ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full transition-transform duration-700 ease-out"
        style={{
          transform: `translateX(-${100 - value}%)`,
          background: 'linear-gradient(90deg, #6FCF97 0%, #56CCF2 100%)',
          boxShadow: '0 0 8px 2px #6FCF97AA',
          animation: value > 0 ? 'growBar 1s cubic-bezier(0.4,0,0.2,1)' : undefined
        }}
      />
      <style jsx>{`
        @keyframes growBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(-${100 - value}%); }
        }
      `}</style>
    </ProgressPrimitive.Root>
  )
} 
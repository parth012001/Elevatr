import * as ProgressPrimitive from '@radix-ui/react-progress'
import { HTMLAttributes } from 'react'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
}

export function Progress({ value, className = '', ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full bg-blue-600 transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  )
} 
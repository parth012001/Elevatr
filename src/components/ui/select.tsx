import { HTMLAttributes, ChangeEvent } from 'react'

interface SelectProps extends Omit<HTMLAttributes<HTMLSelectElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
}

export function Select({ value, onChange, className = '', children, ...props }: SelectProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
} 
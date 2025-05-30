import { HTMLAttributes, ChangeEvent } from 'react'

interface TextareaProps extends Omit<HTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}

export function Textarea({ value, onChange, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
} 
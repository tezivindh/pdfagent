import React from 'react'
import { AlertCircle, SearchX, MessageSquare, HelpCircle } from 'lucide-react'

interface RefusalBadgeProps {
  reason?: string
}

export const RefusalBadge: React.FC<RefusalBadgeProps> = ({ reason }) => {
  let text = 'Unable to answer'
  let Icon = AlertCircle

  switch (reason) {
    case 'out_of_scope':
      text = 'Out of scope'
      Icon = SearchX
      break
    case 'low_confidence':
      text = 'Low confidence'
      Icon = HelpCircle
      break
    case 'small_talk':
      text = 'Small talk'
      Icon = MessageSquare
      break
    case 'no_pdf_loaded':
      text = 'No context'
      Icon = AlertCircle
      break
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-dim/40 border border-warning-dim text-warning text-xs font-syne font-bold uppercase tracking-wider mb-2">
      <Icon size={14} />
      <span>{text}</span>
    </div>
  )
}

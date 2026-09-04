import { useState } from 'react'
import { Share2Icon, MailIcon, CheckIcon } from './Icons'
import './ShareButton.css'

interface ShareButtonProps {
  batchId: string
  batchName: string
  meatType: string
}

export default function ShareButton({ batchId, batchName, meatType }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/batch/${batchId}`
  const shareText = `Join me on Gaucho Meat! Check out batch ${batchName}: ${meatType}. Great prices on premium Argentine beef!`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  const handleShareEmail = () => {
    const subject = `Check out this batch on Gaucho Meat: ${batchName}`
    const body = `${shareText}\n\n${shareUrl}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleShareSocial = () => {
    const text = `${shareText} ${shareUrl}`
    if (navigator.share) {
      navigator.share({
        title: 'Gaucho Meat',
        text: shareText,
        url: shareUrl
      })
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="share-button-group">
      <button className="share-btn copy-btn" onClick={handleCopyLink} title="Copy link to clipboard">
        {copied ? <><CheckIcon /> Copied!</> : <>Copy Link</>}
      </button>
      <button className="share-btn email-btn" onClick={handleShareEmail} title="Share via email">
        <MailIcon /> Share Email
      </button>
      <button className="share-btn social-btn" onClick={handleShareSocial} title="Share with friends">
        <Share2Icon /> Share
      </button>
    </div>
  )
}

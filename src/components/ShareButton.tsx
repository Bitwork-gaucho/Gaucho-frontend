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

  const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}batch/${batchId}`
  const shareText = `Køb med på Gaucho! Se batch ${batchName}: ${meatType}. Argentinsk oksekød af høj kvalitet til den halve pris.`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Linket kunne ikke kopieres')
    }
  }

  const handleShareEmail = () => {
    const subject = `Se denne batch på Gaucho: ${batchName}`
    const body = `${shareText}\n\n${shareUrl}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleShareSocial = () => {
    const text = `${shareText} ${shareUrl}`
    if (navigator.share) {
      navigator.share({
        title: 'Gaucho',
        text: shareText,
        url: shareUrl
      })
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="share-button-group">
      <button className="share-btn copy-btn" onClick={handleCopyLink} title="Kopiér link">
        {copied ? <><CheckIcon /> Kopieret!</> : <>Kopiér link</>}
      </button>
      <button className="share-btn email-btn" onClick={handleShareEmail} title="Del via e-mail">
        <MailIcon /> Del via e-mail
      </button>
      <button className="share-btn social-btn" onClick={handleShareSocial} title="Del med venner">
        <Share2Icon /> Del
      </button>
    </div>
  )
}

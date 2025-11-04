// hooks/useFooterAnimation.ts
import { useEffect } from 'react'

export const useFooterAnimation = () => {
  useEffect(() => {
    // Animation du titre ADK-KASTING en bas de page
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Calculer quand on approche du footer (environ 1000px avant la fin)
      const startAnimation = documentHeight - windowHeight - 1000
      const brandElement = document.querySelector('.footer__brand') as HTMLElement
      
      if (brandElement) {
        if (scrollY > startAnimation) {
          // On approche du bas - le titre remonte du bas vers sa position finale
          const progress = Math.min((scrollY - startAnimation) / 1000, 1)
          
          // L'opacité n'apparaît que dans les 30% finaux du défilement
          // Si progress < 0.7, opacity = 0
          // Si progress >= 0.7, opacity monte de 0 à 1
          const opacity = progress < 0.7 ? 0 : Math.min((progress - 0.5) / 0.3, 1)
          
          brandElement.style.transform = `translateY(${(1 - progress) * 100}%)`
          brandElement.style.opacity = String(opacity)
        } else {
          // Reset position initiale
          brandElement.style.transform = 'translateY(100%)'
          brandElement.style.opacity = '0'
        }
      }
    }

    // Animation cascade des boutons CTA du footer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Ajouter la classe 'animate' pour déclencher l'animation
          entry.target.classList.add('animate')
        }
      })
    }, observerOptions)

    // Observer les boutons CTA du footer
    const footerCtaBtns = document.querySelectorAll('.footer-cta-cascade')
    footerCtaBtns.forEach((btn) => {
      observer.observe(btn)
    })

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])
}
// hooks/useHeaderScroll.ts
import { useEffect } from 'react'

export const useHeaderScroll = () => {
  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updatePageTitleState = () => {
      const scrollY = window.scrollY
      const pageTitle = document.getElementById('page-title')
      
      if (!pageTitle) return

      // Direction du scroll
      const scrollingDown = scrollY > lastScrollY
      const scrollingUp = scrollY < lastScrollY
      
      // Seuils
      const isAtTop = scrollY < 10
      const hasScrolled = scrollY > 100

      if (isAtTop) {
        // En haut de page - titre visible
        pageTitle.classList.remove('page-title--scroll-down', 'page-title--scroll-up')
      } else if (hasScrolled) {
        if (scrollingDown) {
          // Scroll vers le bas - cacher le titre
          pageTitle.classList.add('page-title--scroll-down')
          pageTitle.classList.remove('page-title--scroll-up')
        } else if (scrollingUp) {
          // Scroll vers le haut - montrer le titre
          pageTitle.classList.add('page-title--scroll-up')
          pageTitle.classList.remove('page-title--scroll-down')
        }
      }

      lastScrollY = scrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updatePageTitleState)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}
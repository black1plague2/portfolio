// ========================================
// AR/VR PORTFOLIO - INTERACTIVE 3D EFFECTS
// ========================================
import './styles.css'

// Initialize all interactive features
document.addEventListener('DOMContentLoaded', () => {
  init3DButtons()
  initParallaxEffect()
  initSmoothScroll()
  initCardHoverEffects()
  initNavigation()
  initScrollReveal()
  initEnhanced3DEffects()
  initScrollProgress()
  initCTAButtons()
  initSectionLinks()
  initCertificateModal()
  initCursorGlow()
  
  console.log(
    '%c🚀 GARV BANSAL | XR Developer Portfolio',
    'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #5da9e9, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
  )
  console.log(
    '%cBuilt with immersive 3D effects & smooth transitions',
    'font-size: 14px; color: #5da9e9;'
  )
})

// Enhanced 3D button interactions with mouse tracking - Optimized
function init3DButtons() {
  const buttons = document.querySelectorAll('.btn-3d')

  buttons.forEach((button) => {
    let ticking = false
    
    button.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = button.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          const centerX = rect.width / 2
          const centerY = rect.height / 2

          const rotateX = ((y - centerY) / centerY) * -15
          const rotateY = ((x - centerX) / centerX) * 15

          button.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
          
          ticking = false
        })
        
        ticking = true
      }
    })

    button.addEventListener('mouseleave', () => {
      button.style.transform = ''
    })

    button.addEventListener('click', function () {
      this.style.transform = 'perspective(1000px) scale(0.95)'
      setTimeout(() => {
        this.style.transform = ''
      }, 150)
    })
  })
}

// Minimal, tasteful cursor glow that follows the mouse
function initCursorGlow() {
  // Avoid duplicate
  if (document.querySelector('.cursor-glow')) return

  const glow = document.createElement('div')
  glow.className = 'cursor-glow'
  document.body.appendChild(glow)

  let raf
  const move = (e) => {
    const x = e.clientX
    const y = e.clientY
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      glow.style.left = x + 'px'
      glow.style.top = y + 'px'
    })
  }

  window.addEventListener('mousemove', move, { passive: true })
}

// Parallax effect for floating orbs - Optimized with throttling
function initParallaxEffect() {
  const orbs = document.querySelectorAll('.floating-orb')
  let ticking = false

  document.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const mouseX = e.clientX / window.innerWidth
        const mouseY = e.clientY / window.innerHeight

        orbs.forEach((orb, index) => {
          const speed = (index + 1) * 15
          const x = mouseX * speed
          const y = mouseY * speed

          orb.style.transform = `translate3d(${x}px, ${y}px, 0)`
        })
        
        ticking = false
      })
      
      ticking = true
    }
  })
}

// Smooth scroll navigation
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href'))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })
}

// Navigation button functionality
function initNavigation() {
  const navButtons = document.querySelectorAll('.btn-nav')

  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const buttonText = button.querySelector('.btn-face-front').textContent.toLowerCase()

      const sectionMap = {
        'skills': '.skills-section',
        'projects': '.projects-section',
        'hackathons': '.hackathon-section',
        'experience': '.experience-section',
        'contact': '.contact-section',
        'about': '.hero-section'
      }

      const section = document.querySelector(sectionMap[buttonText])
      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    })
  })

  // CTA buttons
  const ctaButtons = document.querySelectorAll('.cta-buttons .btn-3d')
  ctaButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const buttonText = button.querySelector('.btn-face-front').textContent.toLowerCase()
      if (buttonText.includes('project')) {
        document.querySelector('.projects-section').scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      } else if (buttonText.includes('contact')) {
        document.querySelector('.contact-section').scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    })
  })
}

// Enhanced card hover with 3D depth tracking
function initCardHoverEffects() {
  const cards = document.querySelectorAll('.project-card')

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * 10
      const rotateY = ((x - centerX) / centerX) * 10

      card.style.transform = `perspective(1500px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`

      const glow = card.querySelector('.card-glow')
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, var(--primary) 0%, transparent 60%)`
      }
    })

    card.addEventListener('mouseleave', () => {
      card.style.transform = ''
    })
  })
}

// Initialize Tab Switching
function initTabSwitching() {
  const tabBtns = document.querySelectorAll('.tab-btn')
  const sections = document.querySelectorAll('.content-section')

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab')

      // Remove active class from all tabs and sections
      tabBtns.forEach((b) => b.classList.remove('active'))
      sections.forEach((s) => s.classList.remove('active'))

      // Add active class to clicked tab and corresponding section
      btn.classList.add('active')
      const targetSection = document.querySelector(`[data-section="${targetTab}"]`)
      if (targetSection) {
        targetSection.classList.add('active')
        
        // Smooth scroll to section
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })
}

// Initialize Scroll Reveal Animations
function initScrollReveal() {
  // Reveal individual cards with stagger effect
  const cardElements = document.querySelectorAll('.skill-card, .project-card, .timeline-item, .experience-card, .education-grid > *')
  
  // Add reveal classes to cards with staggered delay
  cardElements.forEach((el, index) => {
    const revealType = index % 3 === 0 ? 'reveal-left' : index % 3 === 1 ? 'reveal-right' : 'reveal-scale'
    el.classList.add(revealType)
  })

  // Reveal entire sections
  const sectionElements = document.querySelectorAll('section.reveal')

  // Intersection Observer for scroll-based reveals
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -80px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active')
      }
    })
  }, observerOptions)

  // Observe cards with staggered delay (reduced from 0.1s to 0.05s)
  cardElements.forEach((el, index) => {
    el.style.transitionDelay = `${index * 0.05}s`
    observer.observe(el)
  })
  
  // Observe sections
  sectionElements.forEach(el => observer.observe(el))
}

// Enhanced 3D Effects with Mouse Tracking - Optimized
function initEnhanced3DEffects() {
  const cards = document.querySelectorAll('.skill-card, .project-card')
  
  cards.forEach(card => {
    let ticking = false
    
    card.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          
          const centerX = rect.width / 2
          const centerY = rect.height / 2
          
          const rotateX = ((y - centerY) / centerY) * 8
          const rotateY = ((x - centerX) / centerX) * 8
          
          card.style.transform = `
            perspective(1500px) 
            rotateX(${-rotateX}deg) 
            rotateY(${rotateY}deg) 
            translateZ(20px)
          `
          
          ticking = false
        })
        
        ticking = true
      }
    })
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = ''
      card.style.background = ''
    })
  })
}

// Initialize Scroll Progress Bar
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress')
  
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrolled = (window.scrollY / windowHeight) * 100
    
    if (progressBar) {
      progressBar.style.width = scrolled + '%'
    }
  })
}

// Initialize CTA Buttons with Smooth Scroll
function initCTAButtons() {
  const ctaButtons = document.querySelectorAll('.cta-buttons .btn-3d')
  
  ctaButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      
      // First button scrolls to projects, second to contact
      const targetSection = index === 0 ? '.projects-section' : '.contact-section'
      const section = document.querySelector(targetSection)
      
      if (section) {
        // Smooth scroll with offset for navbar
        const offsetTop = section.offsetTop - 100
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
        
        // Add pulse animation to target section
        section.style.animation = 'none'
        setTimeout(() => {
          section.style.animation = 'sectionPulse 1s ease-out'
        }, 100)
      }
    })
  })
}

// Initialize Section Links (for social buttons)
function initSectionLinks() {
  const contactButtons = document.querySelectorAll('.btn-contact')
  
  contactButtons.forEach((button) => {
    const buttonText = button.textContent.toLowerCase()
    
    button.addEventListener('click', (e) => {
      e.preventDefault()
      
      if (buttonText.includes('email')) {
        window.location.href = 'mailto:garv16sep@gmail.com'
      } else if (buttonText.includes('linkedin')) {
        window.open('https://linkedin.com/in/garv12bansal', '_blank')
      } else if (buttonText.includes('github')) {
        window.open('https://github.com/black1plague2', '_blank')
      }
    })
  })
}

// Certificate Modal System
function initCertificateModal() {
  const modal = document.getElementById('certificateModal')
  const modalTitle = document.getElementById('modal-title')
  const modalImage = document.getElementById('modal-image')
  const modalClose = document.querySelector('.modal-close')
  const modalOverlay = document.querySelector('.modal-overlay')
  const prevBtn = document.querySelector('.gallery-nav.prev')
  const nextBtn = document.querySelector('.gallery-nav.next')
  const dotsContainer = document.querySelector('.gallery-dots')
  const clickableCards = document.querySelectorAll('.clickable-card')

  // Certificate mapping
  const certificates = {
    sprintathon: {
      title: 'Sprintathon 2024 Certificates',
      images: [
        '/certificates/sprintathon-1.jpeg',
        '/certificates/sprintathon-2.jpeg'
      ]
    },
    hackulus: {
      title: 'Hackulus 2023 Certificates',
      images: [
        '/certificates/hackulus-1.jpg',
        '/certificates/hackulus-2.jpg'
      ]
    },
    innovact: {
      title: 'InnovAct 2024 Certificates',
      images: [
        '/certificates/innovact-1.jpeg',
        '/certificates/innovact-2.jpeg',
        '/certificates/innovact-3.jpeg'
      ]
    },
    yantra: {
      title: 'Yantra Hackathon 2023 Certificates',
      images: [
        '/certificates/yantra-1.jpeg',
        '/certificates/yantra-2.jpeg'
      ]
    }
  }

  let currentHackathon = null
  let currentIndex = 0
  let scrollPosition = 0

  function openModal(hackathonId) {
    currentHackathon = certificates[hackathonId]
    if (!currentHackathon) return

    // Save current scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop
    
    currentIndex = 0
    modalTitle.textContent = currentHackathon.title
    updateImage()
    createDots()
    modal.classList.add('active')
    document.body.classList.add('modal-open')
    
    // Keep page at current scroll position
    document.body.style.top = `-${scrollPosition}px`
  }

  function closeModal() {
    modal.classList.remove('active')
    document.body.classList.remove('modal-open')
    document.body.style.top = ''
    
    // Restore scroll position
    window.scrollTo(0, scrollPosition)
  }

  function updateImage() {
    if (!currentHackathon) return
    
    modalImage.src = currentHackathon.images[currentIndex]
    modalImage.alt = `${currentHackathon.title} - Image ${currentIndex + 1}`
    
    // Update navigation buttons
    prevBtn.disabled = currentIndex === 0
    nextBtn.disabled = currentIndex === currentHackathon.images.length - 1
    
    // Update dots
    updateDots()
  }

  function createDots() {
    if (!currentHackathon) return
    
    dotsContainer.innerHTML = ''
    currentHackathon.images.forEach((_, index) => {
      const dot = document.createElement('div')
      dot.className = 'gallery-dot'
      if (index === currentIndex) dot.classList.add('active')
      dot.addEventListener('click', () => {
        currentIndex = index
        updateImage()
      })
      dotsContainer.appendChild(dot)
    })
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.gallery-dot')
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex)
    })
  }

  function nextImage() {
    if (!currentHackathon || currentIndex >= currentHackathon.images.length - 1) return
    currentIndex++
    updateImage()
  }

  function prevImage() {
    if (!currentHackathon || currentIndex <= 0) return
    currentIndex--
    updateImage()
  }

  // Event listeners
  clickableCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const hackathonId = card.dataset.hackathon
      console.log('Clicked hackathon:', hackathonId) // Debug log
      if (hackathonId && certificates[hackathonId]) {
        openModal(hackathonId)
      } else {
        console.error('Invalid hackathon ID:', hackathonId)
      }
    })
  })

  if (modalClose) modalClose.addEventListener('click', closeModal)
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal)
  if (prevBtn) prevBtn.addEventListener('click', prevImage)
  if (nextBtn) nextBtn.addEventListener('click', nextImage)

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('active')) return
    
    if (e.key === 'Escape') closeModal()
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'ArrowRight') nextImage()
  })
}

// Cursor Glow Effect
function initCursorGlow() {
  const cursorGlow = document.createElement('div')
  cursorGlow.className = 'cursor-glow'
  document.body.appendChild(cursorGlow)

  let mouseX = 0
  let mouseY = 0
  let cursorX = 0
  let cursorY = 0

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
  })

  function animate() {
    cursorX += (mouseX - cursorX) * 0.1
    cursorY += (mouseY - cursorY) * 0.1
    
    cursorGlow.style.left = cursorX + 'px'
    cursorGlow.style.top = cursorY + 'px'
    
    requestAnimationFrame(animate)
  }
  
  animate()
}


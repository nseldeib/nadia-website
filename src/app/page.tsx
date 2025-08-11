"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Github, Twitter, Linkedin, ExternalLink, Play, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function NadiaWebsite() {
  const [typewriterText, setTypewriterText] = useState("Hi, I'm Nadia. I build tools for developers and vibe coders.")
  const [darkMode, setDarkMode] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [mounted, setMounted] = useState(false)
  const fullText = "Hi, I'm Nadia. I build tools for developers and vibe coders."

  // Ensure component is mounted before running effects
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Start with full text, then animate if desired
    let i = 0
    setTypewriterText("")
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypewriterText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
        // Hide cursor after animation completes
        setTimeout(() => setShowCursor(false), 2000)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [mounted, fullText])

  // Handle dark mode
  useEffect(() => {
    if (!mounted) return
    
    // Apply dark class to document body
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [darkMode, mounted])

  const scrollToSection = (sectionId: string) => {
    if (typeof document !== 'undefined') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
    }
  }


  return (
    <div
      className={`min-h-screen transition-all duration-700 ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Minimal Navigation */}
      <nav className={`fixed top-0 w-full backdrop-blur-sm z-50 border-b transition-all duration-700 ${
        darkMode 
          ? "bg-gray-900/90 border-gray-800" 
          : "bg-white/90 border-gray-100"
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className={`font-mono text-sm font-medium transition-colors ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>nadia</div>
            <div className="hidden md:flex items-center space-x-8 text-sm">
              <button
                onClick={() => scrollToSection("home")}
                className={`transition-colors ${
                  darkMode 
                    ? "text-gray-300 hover:text-white" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("work")}
                className={`transition-colors ${
                  darkMode 
                    ? "text-gray-300 hover:text-white" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Work
              </button>
              <button
                onClick={() => scrollToSection("writing")}
                className={`transition-colors ${
                  darkMode 
                    ? "text-gray-300 hover:text-white" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Writing
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className={`transition-colors ${
                  darkMode 
                    ? "text-gray-300 hover:text-white" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                About
              </button>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                darkMode 
                  ? "border-gray-600 hover:border-gray-500 text-gray-300" 
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              {darkMode ? "✨" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-5xl md:text-7xl font-light mb-8 leading-tight transition-colors ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            {mounted ? (
              <>
                {typewriterText}
                {showCursor && <span className="animate-pulse text-blue-500">|</span>}
              </>
            ) : (
              "Hi, I'm Nadia. I build tools for developers and vibe coders."
            )}
          </h1>
          <p className={`text-xl mb-12 max-w-2xl font-light transition-colors ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            Building the future of coding tools, writing about tech, and exploring creative projects.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => scrollToSection("about")}
              className={`px-6 py-3 rounded-full transition-colors ${
                darkMode 
                  ? "bg-white text-gray-900 hover:bg-gray-100" 
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              View About <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection("contact")}
              className={`px-6 py-3 rounded-full border transition-colors ${
                darkMode 
                  ? "border-gray-600 hover:border-gray-500 text-gray-700 hover:text-white" 
                  : "border-gray-300 hover:border-gray-400 text-gray-700"
              }`}
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Work Section - CodeYam */}
      <section id="work" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className={`text-4xl font-light mb-6 transition-colors ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>CodeYam</h2>
              <p className={`text-lg mb-8 leading-relaxed transition-colors ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}>
                Building the next generation of tools that help developers and vibe coders more easily understand, test, and build great software.
              </p>

              <div className="space-y-4">
                <Link
                  href="https://codeyam.com"
                  className={`flex items-center transition-colors group ${
                    darkMode 
                      ? "text-gray-200 hover:text-blue-400" 
                      : "text-gray-900 hover:text-blue-600"
                  }`}
                >
                  <span className="mr-3">Visit Platform</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="https://blog.codeyam.com"
                  className={`flex items-center transition-colors group ${
                    darkMode 
                      ? "text-gray-200 hover:text-blue-400" 
                      : "text-gray-900 hover:text-blue-600"
                  }`}
                >
                  <span className="mr-3">Read Blog</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="https://youtu.be/zdbHboXFG-w"
                  className={`flex items-center transition-colors group ${
                    darkMode 
                      ? "text-gray-200 hover:text-blue-400" 
                      : "text-gray-900 hover:text-blue-600"
                  }`}
                >
                  <span className="mr-3">Watch Demo</span>
                  <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Writing Section */}
      <section id="writing" className={`py-24 px-6 transition-colors ${
        darkMode ? "bg-gray-800/50" : "bg-gray-50/50"
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl font-light mb-6 transition-colors ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>Writing</h2>
          <p className={`text-lg mb-12 max-w-2xl mx-auto transition-colors ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            I write about building, coding, and ideas that shape the future of technology.
          </p>

          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <BookOpen className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`} />
              <h3 className={`text-xl font-medium mb-2 transition-colors ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>Personal Newsletter</h3>
              <p className={`transition-colors ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}>Thoughts on tech, startups, and building great products.</p>
            </div>

            <Link href="https://nseldeib.substack.com/">
              <Button className={`px-8 py-3 rounded-full transition-colors ${
                darkMode 
                  ? "bg-white text-gray-900 hover:bg-gray-100" 
                  : "bg-black text-white hover:bg-gray-800"
              }`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Read on Substack
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`py-24 px-6 transition-colors ${
        darkMode ? "bg-gray-800/50" : "bg-gray-50/50"
      }`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-light mb-6 transition-colors ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>About</h2>
            <p className={`text-lg transition-colors ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}>When I&apos;m not coding, you&apos;ll find me exploring the outdoors.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {[
              {
                title: "Mountain Life",
                desc: "Training for my first marathon, learning to boulder, and chasing sunrise hikes.",
                icon: "🏔️",
              },
              {
                title: "Snowboarding",
                desc: "Favorite mountains: Steamboat Springs and Copper Mountain. Always chasing powder.",
                icon: "🎿",
              },
              {
                title: "Travel",
                desc: "Recent favorites: Buena Vista, South Africa, England. Always planning the next adventure.",
                icon: "✈️",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className={`text-lg font-medium mb-3 transition-colors ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-light mb-6 transition-colors ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>Let&apos;s Connect</h2>
            <p className={`text-lg max-w-2xl mx-auto transition-colors ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}>
              Find me online.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Contact Form */}

            {/* Contact Info & Social */}
            <div className="space-y-8">
              {/* Social Links */}
              <div>
                <h3 className={`text-lg font-medium mb-6 transition-colors ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>Find Me Online</h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "GitHub",
                      icon: Github,
                      href: "https://github.com/nseldeib",
                      handle: "@nseldeib",
                      description: "Code & projects",
                    },
                    {
                      name: "Twitter",
                      icon: Twitter,
                      href: "https://x.com/nseldeib",
                      handle: "@nseldeib",
                      description: "Quick thoughts & updates",
                    },
                    {
                      name: "LinkedIn",
                      icon: Linkedin,
                      href: "https://www.linkedin.com/in/nadiaeldeib/",
                      handle: "Nadia Eldeib",
                      description: "Professional updates",
                    },
                    {
                      name: "Substack",
                      icon: BookOpen,
                      href: "https://nseldeib.substack.com/",
                      handle: "nseldeib.substack.com",
                      description: "Weekly newsletter",
                    },
                  ].map((social, i) => (
                    <Link
                      key={i}
                      href={social.href}
                      className={`flex items-center p-4 rounded-xl transition-all group border hover:shadow-sm ${
                        darkMode 
                          ? "hover:bg-gray-800 border-gray-700 hover:border-gray-600" 
                          : "hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-colors ${
                        darkMode 
                          ? "bg-gray-700 group-hover:bg-gray-600" 
                          : "bg-gray-100 group-hover:bg-gray-200"
                      }`}>
                        <social.icon className={`w-5 h-5 transition-colors ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={`font-medium transition-colors ${
                            darkMode 
                              ? "text-gray-200 group-hover:text-blue-400" 
                              : "text-gray-900 group-hover:text-blue-600"
                          }`}>
                            {social.name}
                          </span>
                          <ExternalLink className={`w-3 h-3 ml-2 transition-colors ${
                            darkMode 
                              ? "text-gray-500 group-hover:text-blue-400" 
                              : "text-gray-400 group-hover:text-blue-500"
                          }`} />
                        </div>
                        <div className={`text-xs mt-1 transition-colors ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}>{social.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className={`rounded-2xl p-6 transition-colors ${
                darkMode 
                  ? "bg-gradient-to-br from-gray-800 to-gray-700" 
                  : "bg-gradient-to-br from-green-50 to-blue-50"
              }`}>
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-3">📍</div>
                  <h3 className={`text-lg font-medium transition-colors ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>Denver, Colorado</h3>
                </div>
                <p className={`text-sm transition-colors ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Mountain time zone (MT). Love meeting fellow builders and outdoor enthusiasts in the area!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className={`py-12 px-6 border-t transition-colors ${
        darkMode ? "border-gray-800" : "border-gray-100"
      }`}>
        <div className="max-w-5xl mx-auto text-center">
          <p className={`text-sm mb-2 transition-colors ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>📍 Based in Denver, Colorado</p>
          <p className={`text-sm transition-colors ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>Built with Next.js and good vibes.</p>
        </div>
      </footer>
    </div>
  )
}

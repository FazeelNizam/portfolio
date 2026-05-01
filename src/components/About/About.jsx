import React from 'react'

import './About.scss'

//UI Components
import IconCloud from '../ui/IconCloud'
import { MagicCard, MagicContainer } from '../ui/MagicCard'
import NumberTicker from '../ui/NumberTicker'
import Marquee from '../ui/Marquee'
import Spotlight from '../ui/Spotlight'
import { FlipWords } from '../ui/flip-words'
import AnimatedGradientText from '../ui/AnimatedGradientText'

//Images
import Grid6BG from '../../img/grid.svg'
import Grid7 from '../../img/b5.svg'
import DP from '../../img/dp.png'
import Medusae from '../ui/medusae/Medusae'

//CV
import CV from '../../cv/Fazeel Nizam - CV.pdf'

//Icons
import { HiSquare3Stack3D } from 'react-icons/hi2'
import { PiCrownSimpleFill } from 'react-icons/pi'
import { IoRocket } from 'react-icons/io5'
import { FaDownload, FaGraduationCap } from 'react-icons/fa'
import { BiLogoGmail } from 'react-icons/bi'

//Data Imports
import {
  languages,
  softwares,
  aboutWords,
  aboutSlugs,
  counterCards,
  aboutCardTabData,
  aboutCardContactData,
  contactCard,
} from '../../data/data'

const About = () => {
  return (
    <section className="aboutWrapper" id="about" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'auto' }}>
        <Medusae />
      </div>
      <div className="bentoContainer relative z-10">
        <MagicContainer
          // Define a responsive grid: 1 column on mobile, 6 on large screens
          className="grid grid-cols-1 lg:grid-cols-6 lg:grid-rows-3 gap-4"
        >
          {/* Container 1 2 3 */}
          {counterCards.map((card) => (
            <MagicCard className="item whitespace-pre-wrap text-6xl font-medium tracking-tighter lg:col-span-2">
              <span className="counter">
                <NumberTicker value={card.value} delay={0.5} /> <p>+</p>
              </span>
              <AnimatedGradientText>
                <span className="bottomText">
                  {card.svg}
                  {card.text}
                </span>
              </AnimatedGradientText>
            </MagicCard>
          ))}

          {/* Container 04 */}
          <MagicCard className="item text-sm lg:col-span-3 lg:row-span-2">
            {/* <BorderBeam size={350} duration={10} delay={9} /> */}
            <div className="topContainer flex justify-between gap-[2%] w-[100%] h-[45%] flex-row">
              <div className="topImgContainer w-[auto] h-[100%]">
                <img src={DP} alt="dp" className="h-[100%] aspect-square" />
              </div>
              <div className="topNameContainer w-[100%] h-[100%] flex flex-col justify-between text-[#ffffffcb] pl-3">
                <span className="availableTab flex flex-row align-middle">
                  <div></div>
                  <p>Available To Work</p>
                </span>
                <div className="flex h-[50%] w-[100%] flex-col justify-end">
                  <span className="name text-3xl text-white">Fazeel Nizam</span>
                  <div>
                    <span>I'm A</span>
                    <span>
                      <FlipWords color="#9100f9" words={aboutWords} />
                    </span>
                  </div>
                </div>
              </div>
              <div className="topButtonContainer w-[100%] h-[100%] flex justify-end text-[#ffffffcb] ">
                <a
                  href={CV}
                  download
                  className="flex flex-row justify-end align-middle gap-3"
                >
                  <p>Resume</p>
                  <span>
                    <FaDownload />
                  </span>
                </a>
              </div>
            </div>
            <div className="midleContainer flex w-[100%] h-[25%] flex-wrap">
              {aboutCardTabData.map((tab) => (
                <span className="midleTab flex flex-row align-middle">
                  {tab.svg}
                  <p>{tab.text}</p>
                </span>
              ))}
            </div>
            <div className="bottomContainer flex justify-between gap-[2%] w-[100%] h-[20%] flex-row flex-wrap">
              {aboutCardContactData.map((card) => (
                <a
                  href={card.link}
                  target="_blank"
                  rel="noreferrer"
                  className="socialLink w-[48%] h-[100%] flex flex-row justify-center"
                >
                  <span>{card.svg}</span>
                  <p>{card.text}</p>
                </a>
              ))}
            </div>
          </MagicCard>

          {/* Container 05 */}
          <MagicCard className="item lg:col-span-3 lg:row-span-3">
            <h1 className="bottomTexth">
              <HiSquare3Stack3D />
              My Tech Stack
            </h1>
            <div className="slidingCardContainer">
              <div className="slidingLeft">
                <Marquee pauseOnHover vertical className="[--duration:20s]">
                  {softwares.map((scard) => (
                    <div className="slidingCard" key={scard.text}>
                      <figure>
                        <img
                          src={scard.svg}
                          alt={scard.text}
                          className="w-[60%]"
                        />
                      </figure>
                      <span>{scard.text}</span>
                    </div>
                  ))}
                </Marquee>
              </div>
              <div className="slidingRight">
                <Marquee
                  reverse
                  pauseOnHover
                  vertical
                  className="[--duration:20s]"
                >
                  {languages.map((lcard) => (
                    <div className="slidingCard" key={lcard.text}>
                      <figure>
                        <img
                          src={lcard.svg}
                          alt={lcard.text}
                          className="w-[60%]"
                        />
                      </figure>
                      <span>{lcard.text}</span>
                    </div>
                  ))}
                </Marquee>
              </div>
            </div>
            <div className="iconCloud">
              <IconCloud iconSlugs={aboutSlugs} />
            </div>
          </MagicCard>

          {/* Container 06 */}
          <MagicCard className="item lg:col-span-2">
            <img className="absolute bg-cover" src={Grid6BG} alt="grid6BG" />
            {/* <img
              className="absolute w-[65%] bottom-0 right-[5%] opacity-80"
              src={Grid6}
              alt="grid6"
            /> */}
            <figure>
              <FaGraduationCap />
            </figure>
            <span className="bottomText">
              <p>Computer Engineering</p>
              <p>Undergraduate</p>
            </span>
          </MagicCard>

          {/* Container 07 */}
          <MagicCard className="item lg:col-span-2">
            <img
              className="absolute w-[70%] bottom-0 right-0 opacity-90"
              src={Grid7}
              alt="grid7"
            />
            <span className="bottomText">
              <p>Tech Enthusiast With </p>
              <p>Passion For Development</p>
            </span>
          </MagicCard>

          {/* Container 08 */}
          <MagicCard className="item lg:col-span-2">
            <h1 className="bottomText">
              <IoRocket />
              Follow Me
            </h1>
            {contactCard.map((card) => (
              <a
                href={card.link}
                className="socialLink"
                target="_blank"
                rel="noreferrer"
              >
                <figure>{card.svg}</figure>
                <span>{card.text}</span>
              </a>
            ))}
          </MagicCard>

          {/* Container 09 */}
          <MagicCard className="item lg:col-span-2">
            <div>
              <Spotlight
                className="-top-[5%] left-[1%] w-[100%] h-[100%]"
                fill="#c385f0"
              />
              <Spotlight
                className="left-[22%] top-0 h-[100%] w-[80%]"
                fill="#9200fa"
              />
            </div>
            <figure>
              <PiCrownSimpleFill />
            </figure>
            <span className="bottomText">
              <p>Let’s Work Together</p>
              <p>Let's Make Magic Happen Together!</p>
            </span>

            <a
              href="mailto:nizamfazeel@gmail.com?subject=Message from Portfolio&body=Hi Fazeel\n"
              className="socialLink"
            >
              <span>
                <BiLogoGmail />
              </span>
              <p>Email Me</p>
            </a>
          </MagicCard>
        </MagicContainer>
      </div>
    </section>
  )
}

export default About

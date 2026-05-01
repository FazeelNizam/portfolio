import React, { useEffect } from 'react'
import { motion, stagger, useAnimate, useInView } from 'framer-motion'
import { cn } from '../../utils/cn'

export const TypewriterEffect = ({ words, className, cursorClassName }) => {
  const [scope, animate] = useAnimate()
  const isInView = useInView(scope, { once: true, margin: "-10%" })

  useEffect(() => {
    if (isInView) {
      animate(
        'span.tw-word',
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0
        },
        {
          duration: 0.4,
          delay: stagger(0.1),
          ease: 'easeOut',
        }
      )
    }
  }, [isInView, animate])

  return (
    <div className={cn('inline font-bold', className)}>
      <motion.div ref={scope} className="inline">
        {words.map((word, idx) => (
          <motion.span
            key={`word-${idx}`}
            className={cn('tw-word opacity-0 inline-block', word.className)}
            initial={{ opacity: 0, filter: 'blur(4px)', y: 5 }}
          >
            {word.text}&nbsp;
          </motion.span>
        ))}
      </motion.div>
      <motion.span
        animate={{ opacity: [1, 1, 0, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear', times: [0, 0.49, 0.5, 0.99, 1] }}
        className={cn(
          'inline-block rounded-sm w-[3px] h-[1.1em] align-middle bg-[#9200fa]',
          cursorClassName
        )}
      />
    </div>
  )
}

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(''),
    }
  })
  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => (
          <div key={`word-${idx}`} className="inline-block">
            {word.text.map((char, index) => (
              <span
                key={`char-${index}`}
                className={cn(`dark:text-white text-black `, word.className)}
              >
                {char}
              </span>
            ))}
            &nbsp;
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex justify-center items-center space-x-1 my-4', className)}>
      <motion.div
        className="overflow-hidden pb-0"
        initial={{
          width: '0%',
        }}
        whileInView={{
          width: 'fit-content',
        }}
        transition={{
          duration: 2,
          ease: 'linear',
          delay: 1,
        }}
      >
        <div
          className="text-xs sm:text-base md:text-xl lg:text:1xl xl:text-2xl font-bold"
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          {renderWords()}{' '}
        </div>{' '}
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,

          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className={cn(
          'block rounded-sm w-[4px]  h-2 sm:h-4 xl:h-8 bg-blue-500',
          cursorClassName
        )}
      ></motion.span>
    </div>
  )
}

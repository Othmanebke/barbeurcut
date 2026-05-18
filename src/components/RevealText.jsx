import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const wordVariants = {
  hidden: { y: '115%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
  },
};

/**
 * Splits children string into words and reveals each from below (overflow mask).
 * tag: the HTML element to render ('h1', 'h2', 'p', 'div', ...)
 */
function RevealText({ children, className = '', tag = 'div', once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '0px 0px -8% 0px' });

  const MotionTag = motion[tag] || motion.div;

  const words =
    typeof children === 'string'
      ? children.split(' ')
      : Array.isArray(children)
      ? children
      : [children];

  return (
    <MotionTag
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.28em' }}
        >
          <motion.span variants={wordVariants} style={{ display: 'inline-block' }}>
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export default RevealText;

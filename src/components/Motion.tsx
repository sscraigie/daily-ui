import React from "react";
import { motion, useAnimation } from "framer-motion";

/**
 * A wrapper to framer motion that animates its children.
 *
 * @param xChange Change the x position of the annimation (e.g. -25 = float in from the left; 25 = float in from the right)
 * @param yChange Change the y position of the annimation (e.g. -25 = float in from the top; 25 = float in from the bottom)
 * @param duration How long the animation should take
 * @param delay How long to wait before starting the animation
 * @param whileInView Whether to only animate when the element is in view
 * @param children Any react components nested inside the Motion component
 * @param className Any classes to apply to the Motion component
 * 
 * Default values:
 * ```{
  xChange = 0,
  yChange = 0,
  delay = 0,
  duration = 1,
  whileInView = false,
  children,
}```
 */
export const Motion = ({
  xChange = 0,
  yChange = 0,
  delay = 0,
  duration = 0.5,
  whileInView = false,
  children,
  className,
}: {
  xChange?: number;
  yChange?: number;
  duration?: number;
  delay?: number;
  whileInView?: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      initial={"hidden"}
      whileInView={whileInView ? "visible" : undefined}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, x: xChange, y: yChange },
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: duration, delay: delay }}
    >
      {children}
    </motion.div>
  );
};

export default Motion;

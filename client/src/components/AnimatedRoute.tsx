import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface AnimatedRouteProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const pageTransition = {
  duration: 0.3,
  ease: "easeInOut",
};

export function AnimatedRoute({ children }: AnimatedRouteProps) {
  const [location] = useLocation();

  return (
    <motion.div
      key={location}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

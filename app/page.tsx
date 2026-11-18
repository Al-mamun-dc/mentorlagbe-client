import { Hero } from "@/components/hero"
import { FeaturedTuitions } from "@/components/sections/featured-tuitions"
import { HowItWorks } from "@/components/sections/how-it-works"
import { PopularSubjects } from "@/components/sections/popular-subjects"
import { Pricing } from "@/components/sections/pricing"
import { StatsTestimonials } from "@/components/sections/stats-testimonials"

export default function Page() {
  return (
    <>
      <Hero />
      <FeaturedTuitions />
      <Pricing />
      <HowItWorks />
      <PopularSubjects />
      <StatsTestimonials />
    </>
  )
}

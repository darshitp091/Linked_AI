import { Sparkles, TrendingUp, Clock, Edit, BarChart, Users } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Writing',
    description: 'Our AI analyzes top-performing LinkedIn content and generates posts optimized for engagement.',
  },
  {
    icon: TrendingUp,
    title: 'Engagement Optimization',
    description: 'AI suggests the best posting times and hashtags based on your audience behavior.',
  },
  {
    icon: Clock,
    title: 'Weekly Batch Generation',
    description: 'Generate an entire week of content in one click. Review, edit, and schedule effortlessly.',
  },
  {
    icon: Edit,
    title: 'Easy Editing',
    description: 'Full control to edit, refine, and personalize every post before publishing.',
  },
  {
    icon: BarChart,
    title: 'Analytics Dashboard',
    description: 'Track your post performance and see what content resonates with your audience.',
  },
  {
    icon: Users,
    title: 'Audience Insights',
    description: 'Understand who engages with your content and optimize your strategy.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#0a66c2]/10 text-[#0a66c2] text-sm font-medium rounded-full mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to grow on LinkedIn
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From content creation to scheduling to analytics - all in one powerful platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-[#0a66c2]/10 flex items-center justify-center mb-6 group-hover:bg-[#0a66c2] transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-[#0a66c2] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

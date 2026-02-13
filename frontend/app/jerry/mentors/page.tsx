"use client";

export default function JerryMentorsPage() {
  const teachingExamples = [
    {
      scenario: "Conduit Run Estimation",
      jerryGuess: "I think this project needs 500ft of EMT conduit based on the floor plan.",
      correction: "No Jerry, we always add 15% for vertical drops and routing around obstacles with this contractor.",
      lesson: "Apply 15% routing factor for complex commercial projects",
      learned: true
    },
    {
      scenario: "Labor Column Selection",
      jerryGuess: "I'll use the Normal column from NECA since this is a standard office building.",
      correction: "Check the site conditions - they have an occupied floor above. That puts us in Difficult column.",
      lesson: "Occupied building conditions require Difficult labor column",
      learned: true
    },
    {
      scenario: "Spec Reading",
      jerryGuess: "The lighting schedule shows standard 2x4 LED fixtures.",
      correction: "Look at Division 26 specs - they require 0-10V dimming on all fixtures. That changes our pricing.",
      lesson: "Always cross-reference schedules with Division 26 specifications",
      learned: false
    },
    {
      scenario: "Panel Schedule Review",
      jerryGuess: "Panel LP-1 has 42 spaces, looks like we need a 225A panel.",
      correction: "Count the actual circuit loads. That panel has 180A demand - we can use a 200A panel and save the client money.",
      lesson: "Calculate actual demand, don't just count spaces",
      learned: false
    }
  ];

  const feedbackMetrics = {
    totalCorrections: 47,
    lessonsLearned: 32,
    successRate: 68,
    topCategories: [
      { name: "Labor Factors", count: 12 },
      { name: "Material Quantities", count: 9 },
      { name: "Spec Interpretation", count: 8 },
      { name: "Project Conditions", count: 6 }
    ]
  };

  return (
    <>
      {/* Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <p className="text-purple-800">
          <strong>Jerry's Mentors:</strong> Jerry learns through daily interaction with your team. Every correction
          becomes a lesson. Every mistake becomes an opportunity to improve. This is the apprentice model in action.
        </p>
      </div>

      {/* Primary Mentor */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl">
              👨‍🏫
            </div>
            <div>
              <h2 className="text-2xl font-bold">The Project Sponsor</h2>
              <p className="text-purple-100 text-lg">VP Operations - Jerry's Primary Mentor</p>
              <p className="text-purple-200 text-sm mt-2">
                The project sponsor has 20+ years of electrical estimation experience and works with Jerry daily
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">What the Mentor Teaches Jerry</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  Your company's pricing philosophy and client relationships
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  When to use standard vs. custom labor factors
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  Reading between the lines on specs and drawings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  Contractor-specific adjustments and history
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  Risk assessment and scope clarifications
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">How the Mentor Teaches</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Reviews Jerry's work and provides corrections
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Explains the "why" behind estimation decisions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Shares war stories and past project lessons
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Voices commands and feedback naturally
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Validates Jerry's assumptions before bid submission
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Moments */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-4xl">💡</div>
          <div>
            <h2 className="text-xl font-bold text-amber-900">How Jerry Learns: Teaching Moments</h2>
            <p className="text-amber-800 mt-2">
              Every time Jerry makes a mistake, the mentor corrects him - and Jerry remembers.
              This is how apprentices become experts. Below are examples of real teaching moments.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {teachingExamples.map((example, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{example.scenario}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  example.learned ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {example.learned ? "✓ Learned" : "📚 Learning"}
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-red-50 rounded p-3">
                  <div className="font-semibold text-red-900 mb-1">Jerry's Initial Guess</div>
                  <p className="text-red-700 italic">"{example.jerryGuess}"</p>
                </div>
                <div className="bg-blue-50 rounded p-3">
                  <div className="font-semibold text-blue-900 mb-1">Mentor's Correction</div>
                  <p className="text-blue-700 italic">"{example.correction}"</p>
                </div>
                <div className="bg-green-50 rounded p-3">
                  <div className="font-semibold text-green-900 mb-1">Lesson Captured</div>
                  <p className="text-green-700">{example.lesson}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Loop Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Progress</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{feedbackMetrics.totalCorrections}</div>
            <div className="text-sm text-gray-600">Total Corrections</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{feedbackMetrics.lessonsLearned}</div>
            <div className="text-sm text-gray-600">Lessons Learned</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{feedbackMetrics.successRate}%</div>
            <div className="text-sm text-gray-600">Retention Rate</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">{feedbackMetrics.topCategories.length}</div>
            <div className="text-sm text-gray-600">Focus Areas</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Top Correction Categories</h3>
          <div className="space-y-2">
            {feedbackMetrics.topCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600">{cat.name}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: `${(cat.count / feedbackMetrics.topCategories[0].count) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-gray-600 text-right">{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Feedback Loop */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">The Continuous Learning Cycle</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">1️⃣</span>
            </div>
            <h3 className="font-semibold text-gray-900">Jerry Attempts</h3>
            <p className="text-sm text-gray-600 mt-1">Jerry makes an estimation decision using his current knowledge</p>
          </div>
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">2️⃣</span>
            </div>
            <h3 className="font-semibold text-gray-900">Mentor Reviews</h3>
            <p className="text-sm text-gray-600 mt-1">The mentor checks Jerry's work and identifies any corrections needed</p>
          </div>
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">3️⃣</span>
            </div>
            <h3 className="font-semibold text-gray-900">Feedback Captured</h3>
            <p className="text-sm text-gray-600 mt-1">The mentor's correction is recorded as training data with context</p>
          </div>
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">4️⃣</span>
            </div>
            <h3 className="font-semibold text-gray-900">Jerry Improves</h3>
            <p className="text-sm text-gray-600 mt-1">Training updates Jerry's model to avoid the same mistake</p>
          </div>
        </div>
      </div>

      {/* Future Mentors */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Expanding the Mentor Network</h2>
        <p className="text-gray-600 mb-4">
          As Jerry grows, more team members can contribute to his training. Each mentor brings unique expertise
          that makes Jerry more capable.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
            <div className="text-2xl mb-2">👷</div>
            <h3 className="font-semibold text-gray-900">Field Supervisors</h3>
            <p className="text-sm text-gray-600">
              Real-world feedback on estimate accuracy vs. actual installation
            </p>
            <div className="mt-2 text-xs text-gray-500">Coming Soon</div>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
            <div className="text-2xl mb-2">💼</div>
            <h3 className="font-semibold text-gray-900">Project Managers</h3>
            <p className="text-sm text-gray-600">
              Scope clarification and client communication patterns
            </p>
            <div className="mt-2 text-xs text-gray-500">Coming Soon</div>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900">Cost Analysts</h3>
            <p className="text-sm text-gray-600">
              Post-project profitability review and pricing adjustments
            </p>
            <div className="mt-2 text-xs text-gray-500">Coming Soon</div>
          </div>
        </div>
      </div>

      {/* Philosophy Footer */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🎓</div>
          <div>
            <h2 className="text-xl font-bold mb-2">The Apprentice Model</h2>
            <p className="text-blue-100">
              "Jerry's a few months into his apprenticeship. Just like any new hire, he needs guidance
              and patience. The difference is - Jerry never forgets a lesson, never takes a sick day,
              and can work alongside multiple estimators simultaneously. By this time next year,
              he'll know your company's business inside and out."
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

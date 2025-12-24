"use client";

import * as motion from "motion/react-client";
import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

// Animation components
const RadarAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/analyze.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading Lottie animation:', error));
  }, []);

  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: 125, height: 125 }}
          />
        ) : (
          <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-white text-sm">Analyzing current workflow..</p>
      </div>
    </div>
  );
};


const CodeEditorAnimation = () => {
  const codeLines = [
    "class AIAssistant:",
    "    def __init__(self, threshold):",
    "        self.threshold = threshold",
    "        self.status = 'active'",
    "        self.model = 'gpt-4'",
    "        self.context = []",
    "",
    "    def process_request(self, user_input):",
    "        # Analyze user intent",
    "        intent = self.analyze_intent(user_input)",
    "        ",
    "        # Generate response",
    "        response = self.generate_response(intent)",
    "        ",
    "        # Update context",
    "        self.context.append(user_input)",
    "        ",
    "        return response",
    "",
    "    def analyze_intent(self, text):",
    "        # Natural language processing",
    "        sentiment = self.get_sentiment(text)",
    "        entities = self.extract_entities(text)",
    "        ",
    "        return {",
    "            'sentiment': sentiment,",
    "            'entities': entities,",
    "            'confidence': 0.95",
    "        }",
    "",
    "    def generate_response(self, intent):",
    "        # AI-powered response generation",
    "        if intent['confidence'] > self.threshold:",
    "            return self.create_response(intent)",
    "        else:",
    "            return self.request_clarification()",
    "",
    "    def create_response(self, intent):",
    "        # Generate contextual response",
    "        response = self.model.generate(",
    "            prompt=intent,",
    "            context=self.context,",
    "            max_tokens=150",
    "        )",
    "        return response",
    "",
    "# Initialize AI Assistant",
    "assistant = AIAssistant(threshold=0.8)",
    "",
    "# Process user request",
    "user_input = 'Help me optimize my workflow'",
    "response = assistant.process_request(user_input)",
    "print(response)",
    "",
    "# Additional AI features",
    "def train_model(self, data):",
    "    # Machine learning training",
    "    self.model.train(data)",
    "    return 'Model trained successfully'",
    "",
    "def optimize_performance(self):",
    "    # Performance optimization",
    "    self.model.optimize()",
    "    return 'Performance optimized'",
    "",
    "# Advanced AI capabilities",
    "class AdvancedAI(AIAssistant):",
    "    def __init__(self, threshold, model_type):",
    "        super().__init__(threshold)",
    "        self.model_type = model_type",
    "        self.learning_rate = 0.001",
    "",
    "    def adaptive_learning(self, feedback):",
    "        # Adaptive learning algorithm",
    "        self.model.update_weights(feedback)",
    "        return 'Learning completed'"
  ];

  return (
    <div className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-gray-400 text-sm font-mono">main.py</div>
        <div className="w-6"></div>
      </div>
      
      {/* Auto-scrolling Code Content */}
      <div className="relative h-40 overflow-hidden">
        <div 
          className="absolute inset-0 p-4 font-mono text-sm text-gray-300 leading-relaxed"
          style={{
            animation: 'scrollCode 8s linear infinite',
            transform: 'translateY(0)'
          }}
        >
          {/* First set of code lines */}
          {codeLines.map((line, index) => (
            <div key={index} className="flex">
              <span className="text-gray-500 w-8 text-right mr-4 select-none">
                {index + 1}
              </span>
              <span className="flex-1">
                {line === "" ? <br /> : line}
              </span>
            </div>
          ))}
          {/* Duplicate content for seamless circular loop */}
          {codeLines.map((line, index) => (
            <div key={`duplicate-${index}`} className="flex">
              <span className="text-gray-500 w-8 text-right mr-4 select-none">
                {index + 1}
              </span>
              <span className="flex-1">
                {line === "" ? <br /> : line}
              </span>
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for smooth effect */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
};

const IntegrationAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/integration-platform.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading Integration Platform Lottie animation:', error));
  }, []);

  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const OptimizationAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/ai-coding.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading AI Coding Lottie animation:', error));
  }, []);

  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const StrategyCards = () => {
  const steps = [
    {
      id: 1,
      title: "Smart Analyzing",
      description: "We assess your needs and identify AI solutions to streamline workflows and improve efficiency.",
      features: ["System check", "Process check", "Speed check", "Manual work", "Repetative task"],
      animation: "radar"
    },
    {
      id: 2,
      title: "AI Development",
      description: "Our team builds intelligent automation systems tailored to your business processes.",
      features: ["Code editor", "Automation triggers", "Python development", "System integration"],
      animation: "code"
    },
    {
      id: 3,
      title: "Seamless Integration",
      description: "We smoothly integrate AI solutions into your existing infrastructure with minimal disruption.",
      features: ["Slack", "ChatGPT", "Gmail", "Discord", "Framer"],
      animation: "integration"
    },
    {
      id: 4,
      title: "Continuous Optimization",
      description: "We refine performance, analyze insights, and enhance automation for long-term growth.",
      features: ["Chatbot system", "Workflow system", "Sales system"],
      animation: "optimization"
    }
  ];

  const renderAnimation = (animationType: string) => {
    switch (animationType) {
      case "radar":
        return <RadarAnimation />;
      case "code":
        return <CodeEditorAnimation />;
      case "integration":
        return <IntegrationAnimation />;
      case "optimization":
        return <OptimizationAnimation />;
      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered 2x2 Grid Cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                {/* Step Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {step.id}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Animation */}
                <div className="w-full">
                  {renderAnimation(step.animation)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategyCards;

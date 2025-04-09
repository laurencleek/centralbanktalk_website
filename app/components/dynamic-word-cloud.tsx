'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Script from 'next/script';
import { Play, Pause } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface TopicData {
  period: string;
  topics: {
    name?: string;
    share: number;
  }[];
}

interface WordCloudProps {
  width?: number;
  height?: number;
  className?: string;
}

declare global {
  interface Window {
    d3: any;
  }
}

const DynamicWordCloud = ({
  width = 800,
  height = 450,
  className,
}: WordCloudProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [topicData, setTopicData] = useState<TopicData[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  const [totalWords, setTotalWords] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cloudRef = useRef<any>(null);
  const previousWordsRef = useRef(new Set<string>());

  // Load and prepare the data
  useEffect(() => {
    setIsClient(true);
    
    fetch('/data/topic_shares.json')
      .then(response => response.json())
      .then(data => {
        // Add names to topics if they don't exist (using index as a placeholder)
        const processedData = data.map((period: any) => ({
          ...period,
          topics: period.topics.map((topic: any, idx: number) => ({
            ...topic,
            name: topic.name || `Topic ${idx + 1}`
          }))
        }));
        
        setTopicData(processedData);
        if (processedData.length > 0) {
          setCurrentPeriod(processedData[0].period);
          setTotalWords(processedData[0].topics.length);
          setWordCount(processedData[0].topics.length);
        }
      })
      .catch(error => console.error("Error loading topic data:", error));
  }, []);

  // Initialize SVG once we confirm client-side rendering
  useEffect(() => {
    if (!isClient || !containerRef.current) return;
    
    // Create SVG if it doesn't exist
    if (!svgRef.current) {
      const svg = d3.select(containerRef.current)
        .append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
      
      svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
      
      svgRef.current = svg.node() as SVGSVGElement;
    }
  }, [isClient, width, height]);

  // Initialize cloud layout once the script has loaded
  useEffect(() => {
    if (!isClient || !scriptLoaded || !topicData.length || !svgRef.current) return;

    try {
      // Initialize cloud layout
      if (!cloudRef.current && window.d3?.layout?.cloud) {
        // Get the actual font used in the app (from the body)
        const appFont = window.getComputedStyle(document.body).fontFamily;
        
        cloudRef.current = window.d3.layout.cloud()
          .size([width, height])
          .padding(5)
          .rotate(() => 0)
          // Use explicit font instead of 'inherit' for consistent measurement
          .font(appFont)
          .fontWeight(600)
          .fontSize(d => calculateFontSize(d.value))
          .on('end', (words: any) => {
            drawCloud(words);
          });
        
        // Initial update
        updateWords();
      }
    } catch (error) {
      console.error("Error initializing cloud layout:", error);
    }
  }, [isClient, scriptLoaded, topicData, width, height]);

  // Update words when current period index changes
  useEffect(() => {
    if (isClient && scriptLoaded && cloudRef.current && topicData.length > 0) {
      updateWords();
    }
  }, [currentPeriodIndex]);

  // Auto play effect - start automatically and continue playing
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (topicData.length > 0 && scriptLoaded && isPlaying) {
      intervalId = setInterval(() => {
        setCurrentPeriodIndex((prev) => (prev + 1) % topicData.length);
      }, 2000); // Match the interval from dynamic.html
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [topicData.length, scriptLoaded, isPlaying]);

  // Calculate font size based on value - reverted to original scaling
  const calculateFontSize = (value: number) => {
    // Use square root scale for better visualization
    const normalized = Math.sqrt(value * 1600);
    
    // Reverted to original scaling factor
    return Math.max(15, Math.min(normalized * 5, 60));
  };

  // Update words based on current period
  const updateWords = () => {
    if (!cloudRef.current || !topicData.length) return;

    const periodData = topicData[currentPeriodIndex];
    if (!periodData) return;

    setCurrentPeriod(periodData.period);
    setTotalWords(periodData.topics.length);
    setWordCount(periodData.topics.length);

    // Create set of previous period words
    const currentWords = new Set(
      periodData.topics
        .map(topic => topic.name || '')
        .filter(Boolean)
    );

    // Get the actual font used in the app for consistent measurement
    const appFont = window.getComputedStyle(document.body).fontFamily;

    // Map topic data to format expected by cloud layout
    const words = periodData.topics.map(topic => ({
      text: topic.name || '',
      value: topic.share,
      wasInPreviousPeriod: previousWordsRef.current.has(topic.name || ''),
      font: appFont, // Explicitly set the font for each word
      weight: 600    // Explicitly set font weight
    }));

    // Store current words as previous for next update
    previousWordsRef.current = currentWords;

    // Removed the periodic reset that was here

    // Set words and start layout
    cloudRef.current
      .previousPeriodWords(previousWordsRef.current)
      .words(words)
      .start();
  };

  // Draw the cloud with animation
  const drawCloud = (words: any[]) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select('g');
    
    const t = d3.transition()
      .duration(750);

    // Join data to text elements
    const text = g.selectAll('text')
      .data(words, (d: any) => d.text);

    // Exit old elements
    text.exit()
      .transition(t)
      .style('opacity', 0)
      .remove();

    // Update existing elements
    text.transition(t)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .style('font-size', (d: any) => `${d.size}px`)
      .style('fill', '#172554');

    // Enter new elements with explicit blue-950 color
    text.enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .style('font-family', (d: any) => d.font || window.getComputedStyle(document.body).fontFamily)
      .style('font-weight', (d: any) => d.weight || 600)
      .style('fill', '#172554')
      .style('opacity', 0)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
      .style('font-size', (d: any) => `${d.size}px`)
      .text((d: any) => d.text)
      .transition(t)
      .style('opacity', 1);
  };

  // Handle script load event
  const handleScriptLoad = () => {
    console.log("d3.layout.cloud script loaded successfully");
    setScriptLoaded(true);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newIndex = Math.round(value[0]);
    setCurrentPeriodIndex(newIndex);
    if (isPlaying) {
      setIsPlaying(false);
    }
  };

  // Format period for display
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    return `${year}-${month || '01'}`;
  };

  return (
    <div className="w-full mb-6">
      {/* Load the d3.layout.cloud script */}
      <Script
        src="/lib/external/d3.layout.cloud.js" 
        strategy="afterInteractive" 
        onLoad={handleScriptLoad}
      />
      
      {/* Top controls - horizontal layout */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={togglePlayPause}
            disabled={!scriptLoaded}
          >
            {isPlaying ? <Pause size={16} className="mr-1" /> : <Play size={16} className="mr-1" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>
        
        <div className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium text-slate-700">
          {currentPeriod}
        </div>
      </div>
      
      {/* Visualization container */}
      <div 
        ref={containerRef} 
        className={`relative w-full bg-white ${className}`}
        style={{ height }}
      >
        {!scriptLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            Loading word cloud visualization...
          </div>
        )}
      </div>
      
      {/* Timeline and slider controls - reverted to default styling */}
      <div className="mt-4 space-y-2">
        {/* Time period display */}
        <div className="flex justify-between text-xs text-slate-500">
          {topicData.length > 0 && (
            <>
              <span>{formatPeriod(topicData[0].period)}</span>
              {topicData.length > 1 && (
                <span>{formatPeriod(topicData[topicData.length - 1].period)}</span>
              )}
            </>
          )}
        </div>
        
        {/* Slider - removed all custom styling */}
        {topicData.length > 0 && (
          <Slider
            defaultValue={[0]}
            value={[currentPeriodIndex]}
            max={topicData.length - 1}
            step={1}
            onValueChange={handleSliderChange}
            disabled={!scriptLoaded}
          />
        )}
      </div>
    </div>
  );
};

export default DynamicWordCloud;

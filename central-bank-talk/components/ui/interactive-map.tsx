'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

// You can use a topojson file from a CDN or include it in your project
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json"

export default function InteractiveCentralBankMap() {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Map of Central Banks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search central banks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <div className="h-[300px] w-full overflow-hidden rounded-lg border bg-muted">
            <ComposableMap projectionConfig={{ scale: 147 }}>
              <ZoomableGroup>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          setSelectedCountry(geo.properties.name)
                        }}
                        style={{
                          default: {
                            fill: geo.properties.name === selectedCountry ? '#22c55e' : '#94a3b8',
                            outline: 'none',
                          },
                          hover: {
                            fill: '#16a34a',
                            outline: 'none',
                          },
                          pressed: {
                            fill: '#15803d',
                            outline: 'none',
                          },
                        }}
                      />
                    ))
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>
          {selectedCountry && (
            <div className="text-sm text-muted-foreground">
              Selected: {selectedCountry}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
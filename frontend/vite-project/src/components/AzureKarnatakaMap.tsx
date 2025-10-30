import React, { useEffect, useRef } from 'react'
import * as atlas from 'azure-maps-control'
import 'azure-maps-control/dist/atlas.min.css'

type Props = {
  onDistrictClick: (d: { id: number; name: string; name_kn?: string }) => void
  selectedDistrictId: number | null
}

const AzureKarnatakaMap: React.FC<Props> = ({ onDistrictClick, selectedDistrictId }) => {
  import React, { useEffect, useRef } from 'react'
  import * as atlas from 'azure-maps-control'
  import 'azure-maps-control/dist/atlas.min.css'

  type Props = {
    onDistrictClick: (d: { id: number; name: string; name_kn?: string }) => void
    selectedDistrictId: number | null
  }

  const AzureKarnatakaMap: React.FC<Props> = ({ onDistrictClick, selectedDistrictId }) => {
    const mapRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      const key = import.meta.env.VITE_AZURE_MAPS_KEY || ''
      const map = new atlas.Map(containerRef.current!, {
        center: [75.7139, 15.3173],
        zoom: 6,
        authOptions: {
          authType: key ? atlas.AuthenticationType.subscriptionKey : atlas.AuthenticationType.anonymous,
          subscriptionKey: key,
        },
      })

      mapRef.current = map

      const datasource = new atlas.source.DataSource()
      map.sources.add(datasource)

      const fill = new atlas.layer.PolygonLayer(datasource, undefined, {
        fillColor: ['get', 'fillColor'],
        fillOpacity: 0.75,
      })
      const line = new atlas.layer.LineLayer(datasource, undefined, {
        strokeColor: '#ffffff',
        strokeWidth: 1,
      })

      map.layers.add(fill)
      map.layers.add(line)

      fetch('/karnataka_districts.json')
        .then((r) => r.json())
        .then((geo) => {
          geo.features.forEach((f: any) => {
            const id = f.properties.id
            const mod = id % 3
            f.properties.fillColor = mod === 0 ? '#22c55e' : mod === 1 ? '#FFC20E' : '#EF4040'
          })
          datasource.add(geo)
        })

      map.events.add('click', (e: any) => {
        const shapes = map.layers.getShapesAt(e.position)
        if (shapes && shapes.length) {
          const props = shapes[0].properties as any
          onDistrictClick({ id: props.id, name: props.name, name_kn: props.name_kn })
        }
      })

      return () => {
        try { map.dispose() } catch {}
      }
    }, [])

    useEffect(() => {
      const map = mapRef.current
      if (!map) return

      // remove existing stroke layers then add an updated one for selection
      const layers = map.layers.getLayers()
      layers.forEach((l: any) => {
        if (l instanceof atlas.layer.LineLayer) {
          try { map.layers.remove(l) } catch {}
        }
      })

      const datasource = map.sources.getSources()[0]
      const strokeLayer = new atlas.layer.LineLayer(datasource, undefined, {
        strokeColor: ['case', ['==', ['get', 'id'], selectedDistrictId], '#059669', '#ffffff'],
        strokeWidth: ['case', ['==', ['get', 'id'], selectedDistrictId], 3, 1],
      })
      map.layers.add(strokeLayer)
    }, [selectedDistrictId])

    return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
  }

  export default AzureKarnatakaMap

  useEffect(() => {
    const key = import.meta.env.VITE_AZURE_MAPS_KEY || ''
    const map = new atlas.Map(containerRef.current!, {
      center: [75.7139, 15.3173],
      zoom: 6,
      authOptions: {
        authType: key ? atlas.AuthenticationType.subscriptionKey : atlas.AuthenticationType.anonymous,
        subscriptionKey: key,
      },
    })

    mapRef.current = map

    const datasource = new atlas.source.DataSource()
    map.sources.add(datasource)

    const fill = new atlas.layer.PolygonLayer(datasource, undefined, {
      fillColor: ['get', 'fillColor'],
      fillOpacity: 0.75,
    })
    const line = new atlas.layer.LineLayer(datasource, undefined, {
      strokeColor: '#ffffff',
      strokeWidth: 1,
    })

    map.layers.add(fill)
    map.layers.add(line)

    fetch('/karnataka_districts.json')
      .then((r) => r.json())
      .then((geo) => {
        geo.features.forEach((f: any) => {
          const id = f.properties.id
          const mod = id % 3
          f.properties.fillColor = mod === 0 ? '#22c55e' : mod === 1 ? '#FFC20E' : '#EF4040'
        })
        datasource.add(geo)
      })

    map.events.add('click', (e: any) => {
      const shapes = map.layers.getShapesAt(e.position)
      if (shapes && shapes.length) {
        const props = shapes[0].properties as any
        onDistrictClick({ id: props.id, name: props.name, name_kn: props.name_kn })
      }
    })

    return () => {
      try { map.dispose() } catch {}
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const datasource = map.sources.getSources()[0]
    const strokeLayer = new atlas.layer.LineLayer(datasource, undefined, {
      strokeColor: ['case', ['==', ['get', 'id'], selectedDistrictId], '#059669', '#ffffff'],
      strokeWidth: ['case', ['==', ['get', 'id'], selectedDistrictId], 3, 1],
    })
    map.layers.add(strokeLayer)
  }, [selectedDistrictId])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
}

export default AzureKarnatakaMap
import React, { useEffect, useRef } from 'react'
import * as atlas from 'azure-maps-control'
import 'azure-maps-control/dist/atlas.min.css'

type Props = {
  onDistrictClick: (d: { id: number; name: string; name_kn?: string }) => void
  selectedDistrictId: number | null
}

const AzureKarnatakaMap: React.FC<Props> = ({ onDistrictClick, selectedDistrictId }) => {
  import React, { useEffect, useRef } from 'react'
  import * as atlas from 'azure-maps-control'
  import 'azure-maps-control/dist/atlas.min.css'

  type Props = {
    onDistrictClick: (d: { id: number; name: string; name_kn?: string }) => void
    selectedDistrictId: number | null
  }

  const AzureKarnatakaMap: React.FC<Props> = ({ onDistrictClick, selectedDistrictId }) => {
    const mapRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      const key = import.meta.env.VITE_AZURE_MAPS_KEY || ''
      const map = new atlas.Map(containerRef.current!, {
        center: [75.7139, 15.3173],
        zoom: 6,
        authOptions: {
          authType: key ? atlas.AuthenticationType.subscriptionKey : atlas.AuthenticationType.anonymous,
          subscriptionKey: key,
        },
      })

      mapRef.current = map

      const datasource = new atlas.source.DataSource()
      map.sources.add(datasource)

      const fill = new atlas.layer.PolygonLayer(datasource, undefined, {
        fillColor: ['get', 'fillColor'],
        fillOpacity: 0.75,
      })
      const line = new atlas.layer.LineLayer(datasource, undefined, {
        strokeColor: '#ffffff',
        strokeWidth: 1,
      })

      map.layers.add(fill)
      map.layers.add(line)

      fetch('/karnataka_districts.json')
        .then((r) => r.json())
        .then((geo) => {
          geo.features.forEach((f: any, idx: number) => {
            const id = f.properties.id
            const mod = id % 3
            f.properties.fillColor = mod === 0 ? '#22c55e' : mod === 1 ? '#FFC20E' : '#EF4040'
          })
          datasource.add(geo)
        })

      map.events.add('click', (e: any) => {
        const shapes = map.layers.getShapesAt(e.position)
        if (shapes && shapes.length) {
          const props = shapes[0].properties as any
          onDistrictClick({ id: props.id, name: props.name, name_kn: props.name_kn })
        }
      })

      return () => {
        try { map.dispose() } catch {}
      }
    }, [])

    useEffect(() => {
      const map = mapRef.current
      if (!map) return
      // simple refresh: update line layer stroke for selected
      const layers = map.layers.getLayers()
      layers.forEach((l: any) => {
        if (l instanceof atlas.layer.LineLayer) {
          try { map.layers.remove(l) } catch {}
        }
      })
      const datasource = map.sources.getSources()[0]
      const strokeLayer = new atlas.layer.LineLayer(datasource, undefined, {
        strokeColor: ['case', ['==', ['get', 'id'], selectedDistrictId], '#059669', '#ffffff'],
        strokeWidth: ['case', ['==', ['get', 'id'], selectedDistrictId], 3, 1],
      })
      map.layers.add(strokeLayer)
    }, [selectedDistrictId])

    return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
  }

  export default AzureKarnatakaMap

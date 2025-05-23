import * as React from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

export default function ClaimPhotosCarousel({ url }: { url: string[] }) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className="flex flex-col items-center">
      <Carousel setApi={setApi} className="max-w-sm">
        <CarouselContent>
          {Array.from({ length: url.length }).map((_, index) => (
            <CarouselItem key={index}>
              <img src={url[index]} key={index} className="aspect-square object-contain" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="text-center text-sm text-muted-foreground">
        {current}/{count}
      </div>
    </div>
  )
}

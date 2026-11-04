import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ModeToggle } from '@/components/toggle-theme'
import { toBase64 } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: App,
})

const formSchema = z.object({
  skin: typeof window === 'undefined' ? z.any() : z.instanceof(FileList),
  scale: z.string(),
  slim: z.string().optional(),
})

function App() {
  const [result, setResult] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Go === 'undefined') {
      return
    }

    const go = new Go()
    WebAssembly.instantiateStreaming(
      fetch('/minime.wasm'),
      go.importObject,
    ).then((wasmResult) => {
      go.run(wasmResult.instance)
    })
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skin: '',
      slim: 'false',
      scale: '5',
    },
  })

  const fileRef = form.register('skin')

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    const { skin, slim: sl, scale: sc } = values
    const base64 = await toBase64(skin)
    const scale = parseInt(sc, 10)
    if (scale < 1 || scale > 10) {
      form.setError('scale', {
        message: 'scale must be in 1 <= scale >= 10',
      })
      return
    }

    const slim = sl === 'true'

    if (typeof window.generateMiniMe === 'function') {
      const response = window.generateMiniMe(base64, scale, slim)
      setResult(response)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-y-5 p-4">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      {result && (
        <img
          src={result}
          alt="Your minime"
          width={100}
          height={100}
          className="h-auto w-auto"
        />
      )}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mini Me</CardTitle>
          <CardDescription>Creates your Minecraft MiniMe</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="skin"
                render={() => (
                  <FormItem>
                    <FormLabel>Skin</FormLabel>
                    <FormControl>
                      <Input id="picture" type="file" {...fileRef} />
                    </FormControl>
                    <FormDescription>Your minecraft skin</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scale</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Image Scale" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(10).keys()].map((key) => {
                            const val = (key + 1).toString()
                            return (
                              <SelectItem value={val} key={val}>
                                {val}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>Result's image scale</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slim</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={String(field.value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Slim" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">false</SelectItem>
                          <SelectItem value="true">true</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Skin Arm Size. Just for 128x128
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

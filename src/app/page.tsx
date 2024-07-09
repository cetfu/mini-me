"use client"

import React, {useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useForm} from "react-hook-form";
import {toBase64} from "@/lib/utils";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {zodResolver} from "@hookform/resolvers/zod";
import Image from "next/image";


const formSchema = z.object({
    skin: typeof window === 'undefined' ? z.any() : z.instanceof(FileList),
    scale: z.string(),
    slim: z.string().optional()
})


function App() {
    const [result, setResult] = useState("");


    useEffect(() => {
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch("minime.wasm"), go.importObject).then((result) => {
            go.run(result.instance);
        });
    }, []);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            skin: '',
            slim: "false",
            scale: "5"
        }
    })

    const fileRef = form.register("skin")

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
        const {skin, slim: sl, scale: sc} = values
        const base64 = await toBase64(skin);
        const scale = parseInt(sc)
        if (scale < 1 && scale > 10) {
            form.setError("scale", {message: "scale must be in 1 <= scale >= 10"})
        }

        const slim = sl === "true"

        const response = window.generateMiniMe(base64, scale, slim)
        setResult(response)
    }

    return (
        <div className={"w-full h-screen flex flex-col justify-center items-center gap-y-5"}>
            {result && <Image src={result} alt={"Your minime"} width={100} height={100} className={"w-auto h-auto"}/>}
            <Card>
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
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Scale</FormLabel>
                                        <FormControl>
                                            <Input id="picture" type="file" {...fileRef}/>
                                        </FormControl>
                                        <FormDescription>
                                            Your minecraft skin
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="scale"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Skin</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Image Scale"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        [...Array(10).keys()].map(key => {
                                                            key += 1
                                                            return <SelectItem value={key.toString()} key={key}>{key}</SelectItem>
                                                        })
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Result's image scale
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slim"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Skin</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Slim"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={"false"}>false</SelectItem>
                                                    <SelectItem value={"true"}>true</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>
                                            Skin Arm Size. Just for 128x128
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default App

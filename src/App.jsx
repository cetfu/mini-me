import {useEffect, useState} from "react";

const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};


function App() {
    const [file, setFile] = useState("")
    const [result, setResult] = useState("");
    const [scale, setScale] = useState(1)
    const [slim, setSlim] = useState(true)

    useEffect(() => {
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch("minime.wasm"), go.importObject).then((result) => {
            go.run(result.instance);
        });
    }, []);


    const handleChangeFile = (event) => {
        event.preventDefault()

        setFile(event.target.files[0])
    }

    const handleChangeScale = (e) =>{
       setScale(e.target.value)
    }

    const handleChangeSlim = (e) =>{
        setSlim(e.target.value === "true")
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const base64 = await toBase64(file);
        const response = generateMiniMe(base64, parseInt(scale), slim)
        setResult(response)
    }

    return (
        <div className={"container"}>
            <form onSubmit={handleSubmit} className={"form"}>
                {result && <img src={result}  alt={"your minime"}/>}
                <input type={"file"} className={"file-upload"} onChange={handleChangeFile}/>
                <select onChange={handleChangeScale} title={"Scale"}>
                    <option selected hidden  label="Scale" />
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                </select>
                <select onChange={handleChangeSlim}>
                    <option selected hidden label={"Slim -For 128x128 skins"}/>
                    <option>
                        true
                    </option>
                    <option>
                        false
                    </option>
                </select>
                <button type={"submit"} className={"button"}>Create Mini-Me</button>
            </form>
        </div>
    )
}

export default App

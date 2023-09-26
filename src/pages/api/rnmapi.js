import jwt from "jsonwebtoken";

const handler = async  (req, res) => {
    if(req.method === 'GET'){
        const myToken = req.cookies[process.env.TOKEN_NAME]
        if (!myToken) {
            return res.status(401).json({ error: "Not logged in" });
        }

        try{
            const jwtVerify = jwt.verify(myToken, process.env.JWT_SECRET);
            console.log(jwtVerify)
        }catch(error){
            return res.status(401).json({ error: "Not logged in" });
        }

        let queryString = ''
        if(Object.keys(req.query).length > 0){
            const obj = req.query
            queryString = Object.keys(obj)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join('&');
            queryString = `?${queryString}`
        }
        const response = await fetch(`https://rickandmortyapi.com/api/character${queryString}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        if(response.status === 200){
            const characters = await response.json()
            return res.status(200).json(characters)
        }else{
            const error = await response.json()
            return res.status(response.status).json(error)
        }
    }
}

export default handler
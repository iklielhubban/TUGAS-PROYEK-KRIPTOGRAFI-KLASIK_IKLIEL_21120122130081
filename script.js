function log(msg){
    document.getElementById("logBox").innerHTML += msg+"<br>";
}

function cleanText(text){
    return text.toUpperCase().replace(/[^A-Z]/g,'');
}

document.getElementById("fileInput").addEventListener("change",function(e){
    const reader=new FileReader();
    reader.onload=function(){
        document.getElementById("inputText").value=btoa(reader.result);
        log("File dikonversi ke Base64");
    };
    reader.readAsBinaryString(e.target.files[0]);
});

function vigenere(text,key,decrypt=false){
    text=cleanText(text);
    key=cleanText(key);
    let result="";
    for(let i=0;i<text.length;i++){
        let t=text.charCodeAt(i)-65;
        let k=key.charCodeAt(i%key.length)-65;
        if(decrypt) k=-k;
        result+=String.fromCharCode((t+k+26)%26+65);
    }
    log("Vigenere selesai");
    return result;
}

function modInverse(a,m){
    for(let x=1;x<m;x++){
        if((a*x)%m==1) return x;
    }
}

function affine(text,a,b,decrypt=false){
    text=cleanText(text);
    let result="";
    let invA=modInverse(a,26);
    for(let i=0;i<text.length;i++){
        let x=text.charCodeAt(i)-65;
        if(decrypt)
            x=invA*(x-b+26)%26;
        else
            x=(a*x+b)%26;
        result+=String.fromCharCode(x+65);
    }
    log("Affine selesai");
    return result;
}

function generateMatrix(key){
    key=cleanText(key.replace(/J/g,'I'));
    let alphabet="ABCDEFGHIKLMNOPQRSTUVWXYZ";
    let matrix=[];
    let used="";
    for(let c of key){
        if(!used.includes(c)){ used+=c; matrix.push(c); }
    }
    for(let c of alphabet){
        if(!used.includes(c)) matrix.push(c);
    }
    return matrix;
}

function playfair(text,key,decrypt=false){
    text=cleanText(text.replace(/J/g,'I'));
    let matrix=generateMatrix(key);
    let result="";
    for(let i=0;i<text.length;i+=2){
        let a=text[i];
        let b=text[i+1]||'X';
        if(a==b) b='X';

        let posA=matrix.indexOf(a);
        let posB=matrix.indexOf(b);
        let rowA=Math.floor(posA/5), colA=posA%5;
        let rowB=Math.floor(posB/5), colB=posB%5;

        if(rowA==rowB){
            colA=(colA+(decrypt?4:1))%5;
            colB=(colB+(decrypt?4:1))%5;
        }
        else if(colA==colB){
            rowA=(rowA+(decrypt?4:1))%5;
            rowB=(rowB+(decrypt?4:1))%5;
        }
        else{
            let temp=colA;
            colA=colB;
            colB=temp;
        }

        result+=matrix[rowA*5+colA];
        result+=matrix[rowB*5+colB];
    }
    log("Playfair selesai");
    return result;
}

function modInverse(a, m){
    a = ((a % m) + m) % m;
    for(let x = 1; x < m; x++){
        if((a * x) % m === 1)
            return x;
    }
    return null;
}

function matrixMultiply(mat, vec){
    let result = [];
    for(let i=0;i<3;i++){
        result[i] = (mat[i][0]*vec[0] +
                     mat[i][1]*vec[1] +
                     mat[i][2]*vec[2]) % 26;
    }
    return result;
}

function determinant3x3(m){
    return (
        m[0][0]*(m[1][1]*m[2][2] - m[1][2]*m[2][1]) -
        m[0][1]*(m[1][0]*m[2][2] - m[1][2]*m[2][0]) +
        m[0][2]*(m[1][0]*m[2][1] - m[1][1]*m[2][0])
    );
}

function adjoint3x3(m){
    return [
        [
            (m[1][1]*m[2][2] - m[1][2]*m[2][1]),
            -(m[0][1]*m[2][2] - m[0][2]*m[2][1]),
            (m[0][1]*m[1][2] - m[0][2]*m[1][1])
        ],
        [
            -(m[1][0]*m[2][2] - m[1][2]*m[2][0]),
            (m[0][0]*m[2][2] - m[0][2]*m[2][0]),
            -(m[0][0]*m[1][2] - m[0][2]*m[1][0])
        ],
        [
            (m[1][0]*m[2][1] - m[1][1]*m[2][0]),
            -(m[0][0]*m[2][1] - m[0][1]*m[2][0]),
            (m[0][0]*m[1][1] - m[0][1]*m[1][0])
        ]
    ];
}

function inverseMatrix3x3(m){
    let det = determinant3x3(m);
    det = ((det % 26) + 26) % 26;

    let invDet = modInverse(det,26);
    if(invDet === null){
        alert("Determinan tidak memiliki invers modulo 26!");
        return null;
    }

    let adj = adjoint3x3(m);
    let inv = [];

    for(let i=0;i<3;i++){
        inv[i] = [];
        for(let j=0;j<3;j++){
            inv[i][j] = ((adj[i][j] * invDet) % 26 + 26) % 26;
        }
    }
    return inv;
}

function hill(text,key,decrypt=false){
    text = text.toUpperCase().replace(/[^A-Z]/g,'');
    
    while(text.length % 3 !== 0){
        text += "X";
    }

    let k = key.split(',').map(Number);
    if(k.length !== 9){
        alert("Key harus 9 angka untuk matriks 3x3");
        return "";
    }

    let matrix = [
        [k[0],k[1],k[2]],
        [k[3],k[4],k[5]],
        [k[6],k[7],k[8]]
    ];

    if(decrypt){
        matrix = inverseMatrix3x3(matrix);
        if(matrix === null) return "";
    }

    let result = "";

    for(let i=0;i<text.length;i+=3){
        let vec = [
            text.charCodeAt(i)-65,
            text.charCodeAt(i+1)-65,
            text.charCodeAt(i+2)-65
        ];

        let resVec = matrixMultiply(matrix,vec);

        result += String.fromCharCode(resVec[0]+65);
        result += String.fromCharCode(resVec[1]+65);
        result += String.fromCharCode(resVec[2]+65);
    }

    log("Hill 3x3 selesai");
    return result;
}

function enigma(text){
    text=cleanText(text);
    let rotor="EKMFLGDQVZNTOWYHXUSPAIBRCJ";
    let result="";
    let pos=0;
    for(let i=0;i<text.length;i++){
        let c=text.charCodeAt(i)-65;
        c=(c+pos)%26;
        c=rotor.charCodeAt(c)-65;
        c=(c-pos+26)%26;
        result+=String.fromCharCode(c+65);
        pos=(pos+1)%26;
    }
    log("Enigma selesai");
    return result;
}

function encrypt(){
    log("=== ENKRIPSI ===");
    let type=document.getElementById("cipherType").value;
    let text=document.getElementById("inputText").value;
    let key=document.getElementById("key").value;
    let output="";

    if(type=="vigenere") output=vigenere(text,key,false);
    else if(type=="affine"){ let [a,b]=key.split(',').map(Number); output=affine(text,a,b,false); }
    else if(type=="playfair") output=playfair(text,key,false);
    else if(type=="hill") output=hill(text,key,false);
    else if(type=="enigma") output=enigma(text);

    document.getElementById("outputText").value=output;
}

function decrypt(){
    log("=== DEKRIPSI ===");
    let type=document.getElementById("cipherType").value;
    let text=document.getElementById("inputText").value;
    let key=document.getElementById("key").value;
    let output="";

    if(type=="vigenere") output=vigenere(text,key,true);
    else if(type=="affine"){ let [a,b]=key.split(',').map(Number); output=affine(text,a,b,true); }
    else if(type=="playfair") output=playfair(text,key,true);
    else if(type=="hill") output=hill(text,key,true);
    else if(type=="enigma") output=enigma(text);

    document.getElementById("outputText").value=output;
}

function downloadResult(){
    let text=document.getElementById("outputText").value;
    let blob=new Blob([text],{type:"text/plain"});
    let a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="hasil.txt";
    a.click();
}
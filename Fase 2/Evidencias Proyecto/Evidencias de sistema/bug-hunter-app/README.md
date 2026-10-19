## Instrucciones:

Una vez realizado el git clone, corremos 
```
1 npm install

2 (con docker abierto) docker compose up -d

3 npx prisma migrate dev

4 Para poblar la base de datos, es necesario utilizar npx prisma db seed

5 npm run dev

6 Si queremos ver o realizar cambios a la base de datos, realizamos el comando npx prisma studio, esto abrira una ventana en nuestro navegador.


```

La aplicación estará disponible en:
[http://localhost:3000](http://localhost:3000) en tu navegador.

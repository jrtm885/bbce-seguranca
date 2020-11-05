# Introduction 
Este projeto tem como objetivo ser o componente que irá verificar se determinado usuário possui acesso a determinada api. Será peça fundamental na arquitetura de segurança.


# Getting Started

1.	Installation process <br/>
Para executar o projeto siga os passo abaixo:<br/>
1 - Baixe o código fonte do repositório;<br/>
2 - No diretório do projeto execute o comando: npm install <br/>
3 - compile o código: tsc<br/>
4 - Para rodar o projeto, finalmente, execute o comando: npm run local;<br/>

2.	API references <br/>
O projeto possui dois endpoints: <br/>

 - GET /security/v1/user_scopes?userEmail=email@email.com <br/>
Retorna todos os scopes (servicos) que o usuário do parametro userEmail possui para acesso ao frontend.

 - POST /security/v1/access/validate_access
```
header:
Authorization=Bearer eyJraWQiOiJFdTc3WXNaRTRHUmd1NERRXC9KN2ZXN3VqUTNhR2xcL2w5K2FEZTdQdWc5SGc9IiwiYWxnIjoiUlMyNTYifQ.eyJhdF9oYXNoIjoiZkMwS3FSWkZHclcwYS1wMXUxd3p3USIsInN1YiI6IjU0MGVkODI2LTIyZTEtNDlhYS1iYTJlLWZhNTZhNGQ2YjRiNCIsImF1ZCI6IjN1ODZpbWc0MG5maGJjcTdyOHEyN2ZqZGsyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV2ZW50X2lkIjoiMTdlZWQyMjAtOGIyMS00Mjg1LWIwZDMtNzI0MTZiMTFjM2YyIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1OTI1OTA1NTQsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX09BaEhLVnNFYSIsImNvZ25pdG86dXNlcm5hbWUiOiI1NDBlZDgyNi0yMmUxLTQ5YWEtYmEyZS1mYTU2YTRkNmI0YjQiLCJleHAiOjE1OTI1OTQxNTQsImlhdCI6MTU5MjU5MDU1NCwiZW1haWwiOiJqb25hdGhhbi50Lm1hcnRpbmV6QGdtYWlsLmNvbSJ9.V1YD9iCgedrFPtZzC_B4PU3kLVQ1bvJN4GHphiLctH7mGWs1uGnhMDLbra_S18maQXAlBwt-iJJqwX1K7SnwinWK3bzIIIS8MgxUq0cJhPbk--SxdNHvOzxFCZ0dvkWZTcYnu2fMGbNaLI8GtDEHYWauUX6X0cnRQAT6wDfDyfmolz9wCCQVMMfQE8qZUk-XR8ikhSOV1Sr0NsvSElj6XAmeVZPi6kVnpGk-ZZf-Itha4ixHJo-v4Yh5-8jV8N8Cx7f_vTsNYbn4EEpb6yfsrhK2cEPH190uKD-ktdIACtBFfOKakzbLZGxfyhXiWIaK34ifx7F3e_FThynXT8tf2w
body:
{
  "api": "/security/v1/user_scope/test",
  "verb": "GET"
}
```
Esta api é responsável por fazer a validação se o usuário que está no IdToken (recupera informação do email do usuario do token) possui os scopes necessários para acessar a api contida no body da requisição.
Esta api precisa receber o idToken do usuário no header no campo Authorization (obrigatório) e espera dois campos obrigatórios no body: api (endpoint da requisição) e verb (verbo http da requisição).<br/>
Para cadastrar apis com path param substitua o path param pelos caracteres #{}, conforme exemplo abaixo:<br/>
api para acesso: /security/v1/users/1000/scopes<br/>
para o cadastro no segurança ficaria: /security/v1/users/#{}/scopes

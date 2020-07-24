###STAGE-1###
# ---- Base Node ----
#imagem padrão para o container: já possui instalado o nodeJS.
FROM alpine:3.12 as base
# install node
RUN apk add --update nodejs npm
#install tini for entrypoint
RUN apk add --no-cache tini
# indica o diretório de trabalho
WORKDIR /usr/src/app
#comando entrypoint
ENTRYPOINT ["/sbin/tini", "--"]
# copy project file
COPY package*.json ./


###STAGE-2###
# ---- Dependencies ----
FROM base AS dependencies-production
# install node packages
RUN npm install --only=production
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'


#STAGE-3###
FROM base AS compiled
RUN npm install
COPY . .
#compile source code and generate build folder
RUN npm run compile
#copy folder build
RUN cp -R build prod_build


###STAGE-4###
# run linters and tests
FROM compiled AS test
RUN  npm run lint && npm run test


###STAGE-5###
FROM dependencies-production AS release
# copy production node_modules
COPY --from=compiled /usr/src/app/prod_build ./build
# copy app sources
COPY . .
# expose port and define CMD
EXPOSE 8000
CMD npm run start
#!/usr/bin/env node
import { Server } from './server'
import { program } from 'commander'
import { readFileSync } from 'fs'
import { StaticKeyvault } from '../keyvault/static.keyvault'
import { Keyvault } from '../keyvault/keyvault.interfaces'

const config = require('../../package.json')

program
    .version(config.version)
    .description("An example remote signer")
    .requiredOption('--ca-crt-path <path>', 'Path to CA certificate')
    .requiredOption('--tls-key-path <path>', 'Path to tls key')
    .requiredOption('--tls-crt-path <path>', 'Path to tls certificate')
    .option('-p, --grpc-port <number>', 'Port number of remote sign server', '4000')
    .option('-H, --grpc-server-host <address>', 'Host', '127.0.0.1')
    .option('-K, --keyvault <keyvault>', 'Keyvault type', 'static')
    .command('server', {isDefault: true})
    .action((args) => {
        let caCert, tlsKey, tlsCert
        try {
            caCert = readFileSync(program.caCrtPath)
        } catch (e) {
            console.error('Error loading CA cert')
            process.exit(1)
        }
        try {
            tlsCert = readFileSync(program.tlsCrtPath)
        } catch (e) {
            console.error('Error loading TLS cert')
            process.exit(1)
        }
        try {
            tlsKey = readFileSync(program.tlsKeyPath)
        } catch (e) {
            console.error('Error loading TLS key')
            process.exit(1)
        }
        let keyvault: Keyvault
        switch(program.keyvault){
            case 'static':
                keyvault = new StaticKeyvault()
                break
            default:
                console.error(`unknown keyvault type ${program.keyvault}`)
                process.exit(1)
        }
        const server = new Server({
            caCert,
            tlsCert,
            tlsKey,
            port: program.grpcPort,
            host: program.grpcServerHost,
        }, keyvault)
        server.serve()
    })

program.parse(process.argv);
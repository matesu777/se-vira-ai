import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

type Jogo = {
  id: string;
  titulo: string;
  genero: string;
  nota: string;
  imagem: string;
  imagemAlternativa: string;
  descricao: string;
  plataformas: string[];
  cor: string;
};

type Review = {
  id: string;
  jogoId: string;
  usuario: string;
  nota: number;
  tags: string[];
  recomendaria: boolean;
  texto: string;
  data: string;
};

type Usuario = {
  nome: string;
  email: string;
};

type Aba = 'home' | 'favoritos' | 'perfil';

const CHAVE_USUARIO = '@ducklist/usuario';
const CHAVE_FAVORITOS = '@ducklist/favoritos';
const CHAVE_REVIEWS = '@ducklist/avaliacoes';

const jogos: Jogo[] = [
  {
    id: 'elden-ring',
    titulo: 'Elden Ring',
    genero: 'RPG • Mundo aberto',
    nota: '9.5',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_600x900.jpg',
    imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg',
    descricao: 'Explore as Terras Intermédias, enfrente chefes desafiadores e descubra segredos em um enorme mundo de fantasia.',
    plataformas: ['PC', 'PS4', 'PS5', 'Xbox'],
    cor: '#65513F',
  },
  {
    id: 'cyberpunk-2077',
    titulo: 'Cyberpunk 2077',
    genero: 'RPG • Ficção científica',
    nota: '8.5',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_600x900.jpg',
    imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
    descricao: 'Entre em Night City, uma metrópole futurista cheia de escolhas, personagens marcantes e missões.',
    plataformas: ['PC', 'PS4', 'PS5', 'Xbox'],
    cor: '#725A20',
  },
  {
    id: 'hollow-knight',
    titulo: 'Hollow Knight',
    genero: 'Metroidvania • Aventura',
    nota: '9.2',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/367520/library_600x900.jpg',
    imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg',
    descricao: 'Explore um reino subterrâneo desenhado à mão, repleto de segredos, criaturas e combates precisos.',
    plataformas: ['PC', 'PS4', 'Nintendo Switch', 'Xbox'],
    cor: '#394D5C',
  },
  {
    id: 'stardew-valley',
    titulo: 'Stardew Valley',
    genero: 'Simulação • Relaxante',
    nota: '9.0',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/413150/library_600x900.jpg',
    imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg',
    descricao: 'Construa sua fazenda, conheça os moradores, pesque, explore cavernas e crie sua própria rotina no campo.',
    plataformas: ['PC', 'PS4', 'Nintendo Switch', 'Xbox', 'Mobile'],
    cor: '#52663F',
  },
  {
    id: 'baldurs-gate-3', titulo: "Baldur's Gate 3", genero: 'RPG • Fantasia', nota: '9.7',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
    descricao: 'Monte seu grupo, tome decisões importantes e enfrente uma aventura de RPG baseada em escolhas.', plataformas: ['PC', 'PS5', 'Xbox'], cor: '#5B3C4A',
  },
  {
    id: 'red-dead-redemption-2', titulo: 'Red Dead Redemption 2', genero: 'Ação • Mundo aberto', nota: '9.6',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg',
    descricao: 'Viva uma história de faroeste em um mundo aberto cheio de personagens, missões e exploração.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#613D2D',
  },
  {
    id: 'the-witcher-3', titulo: 'The Witcher 3: Wild Hunt', genero: 'RPG • Fantasia sombria', nota: '9.4',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
    descricao: 'Acompanhe Geralt em uma jornada com monstros, contratos, escolhas e grandes regiões para explorar.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#3D5147',
  },
  {
    id: 'god-of-war', titulo: 'God of War', genero: 'Ação • Aventura', nota: '9.3',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1593500/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1593500/header.jpg',
    descricao: 'Kratos e Atreus atravessam os reinos nórdicos em uma aventura de combate e narrativa.', plataformas: ['PC', 'PS4'], cor: '#42566B',
  },
  {
    id: 'spider-man-remastered', titulo: 'Marvel’s Spider-Man Remastered', genero: 'Ação • Super-heróis', nota: '9.0',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1817070/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1817070/header.jpg',
    descricao: 'Balance por Nova York, enfrente vilões e acompanhe uma história original do Homem-Aranha.', plataformas: ['PC', 'PS5'], cor: '#773B37',
  },
  {
    id: 'hades', titulo: 'Hades', genero: 'Roguelike • Ação', nota: '9.3',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg',
    descricao: 'Lute para escapar do submundo em partidas dinâmicas, com personagens e armas variadas.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#713A35',
  },
  {
    id: 'terraria', titulo: 'Terraria', genero: 'Sandbox • Aventura', nota: '9.1',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg',
    descricao: 'Cave, construa, crie equipamentos e enfrente chefes em um mundo 2D cheio de possibilidades.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch', 'Mobile'], cor: '#3C6548',
  },
  {
    id: 'minecraft', titulo: 'Minecraft', genero: 'Sandbox • Sobrevivência', nota: '9.4',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1928870/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1928870/header.jpg',
    descricao: 'Explore mundos gerados, construa suas ideias e sobreviva sozinho ou com amigos.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch', 'Mobile'], cor: '#426B42',
  },
  {
    id: 'portal-2', titulo: 'Portal 2', genero: 'Puzzle • Ficção científica', nota: '9.5',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/620/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/620/header.jpg',
    descricao: 'Resolva quebra-cabeças usando portais em uma experiência criativa e cheia de humor.', plataformas: ['PC', 'Xbox'], cor: '#4D6572',
  },
  {
    id: 'left-4-dead-2', titulo: 'Left 4 Dead 2', genero: 'Tiro • Cooperativo', nota: '9.0',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/550/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/550/header.jpg',
    descricao: 'Sobreviva a hordas de infectados em campanhas cooperativas com até quatro jogadores.', plataformas: ['PC', 'Xbox'], cor: '#67453C',
  },
  {
    id: 'resident-evil-4', titulo: 'Resident Evil 4', genero: 'Terror • Ação', nota: '9.2',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2050650/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2050650/header.jpg',
    descricao: 'Encare uma missão perigosa com exploração, combate e momentos de tensão.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#4D5147',
  },
  {
    id: 'sekiro', titulo: 'Sekiro: Shadows Die Twice', genero: 'Ação • Desafio', nota: '9.1',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/814380/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/814380/header.jpg',
    descricao: 'Domine combates precisos com espada em uma aventura ambientada no Japão feudal.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#66513B',
  },
  {
    id: 'forza-horizon-5', titulo: 'Forza Horizon 5', genero: 'Corrida • Mundo aberto', nota: '9.0',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1551360/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1551360/header.jpg',
    descricao: 'Corra por paisagens variadas do México com uma grande seleção de carros e eventos.', plataformas: ['PC', 'Xbox'], cor: '#4E6572',
  },
  {
    id: 'slay-the-spire', titulo: 'Slay the Spire', genero: 'Cartas • Roguelike', nota: '9.0',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/646570/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/646570/header.jpg',
    descricao: 'Monte um baralho estratégico e avance por uma torre com encontros e caminhos diferentes.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch', 'Mobile'], cor: '#544B6B',
  },
  {
    id: 'celeste', titulo: 'Celeste', genero: 'Plataforma • Precisão', nota: '9.2',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/504230/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/504230/header.jpg',
    descricao: 'Ajude Madeline a escalar uma montanha em fases desafiadoras e uma história emocionante.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#554A7A',
  },
  {
    id: 'among-us', titulo: 'Among Us', genero: 'Social • Dedução', nota: '8.5',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/945360/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/945360/header.jpg',
    descricao: 'Trabalhe em equipe e descubra quem está sabotando a nave em partidas com amigos.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch', 'Mobile'], cor: '#4D536E',
  },
  {
    id: 'dead-cells', titulo: 'Dead Cells', genero: 'Roguelite • Ação', nota: '9.0',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/588650/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/588650/header.jpg',
    descricao: 'Explore um castelo em constante mudança com combate rápido e progressão desafiadora.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch', 'Mobile'], cor: '#3F5E62',
  },
  {
    id: 'the-sims-4', titulo: 'The Sims 4', genero: 'Simulação • Vida', nota: '8.4',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1222670/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1222670/header.jpg',
    descricao: 'Crie personagens, construa casas e acompanhe histórias e relações do jeito que quiser.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#4E7552',
  },
  {
    id: 'dota-2', titulo: 'Dota 2', genero: 'MOBA • Competitivo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/570/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/570/header.jpg',
    descricao: 'Escolha um herói, forme uma equipe e dispute partidas estratégicas em tempo real.', plataformas: ['PC'], cor: '#753D34',
  },
  {
    id: 'team-fortress-2', titulo: 'Team Fortress 2', genero: 'Tiro • Equipes', nota: '8.9',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/440/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/440/header.jpg',
    descricao: 'Participe de partidas por equipes com classes diferentes, objetivos variados e estilo cartunesco.', plataformas: ['PC'], cor: '#76543B',
  },
  {
    id: 'no-mans-sky', titulo: "No Man's Sky", genero: 'Exploração • Sobrevivência', nota: '8.7',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/275850/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/275850/header.jpg',
    descricao: 'Viaje por planetas, descubra criaturas, colete recursos e construa sua base no espaço.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#3E5E70',
  },
  {
    id: 'grand-theft-auto-v', titulo: 'Grand Theft Auto V', genero: 'Ação • Mundo aberto', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/271590/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/271590/header.jpg',
    descricao: 'Explore Los Santos, complete missões e viva histórias no mundo aberto.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#57435F',
  },
  {
    id: 'counter-strike-2', titulo: 'Counter-Strike 2', genero: 'Tiro • Competitivo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/730/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
    descricao: 'Dispute partidas táticas de tiro em equipes e teste sua precisão.', plataformas: ['PC'], cor: '#405E6B',
  },
  {
    id: 'pubg-battlegrounds', titulo: 'PUBG: Battlegrounds', genero: 'Battle royale • Tiro', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/578080/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/578080/header.jpg',
    descricao: 'Pouse em uma ilha, encontre equipamentos e lute para ser o último sobrevivente.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#71503A',
  },
  {
    id: 'apex-legends', titulo: 'Apex Legends', genero: 'Battle royale • Tiro', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1172470/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1172470/header.jpg',
    descricao: 'Escolha uma lenda com habilidades próprias e enfrente outras equipes.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#3F6255',
  },
  {
    id: 'rainbow-six-siege', titulo: 'Tom Clancy’s Rainbow Six Siege', genero: 'Tiro • Tático', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/359550/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/359550/header.jpg',
    descricao: 'Planeje ataques e defesas em confrontos táticos entre operadores.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#66534A',
  },
  {
    id: 'call-of-duty-modern-warfare-iii', titulo: 'Call of Duty: Modern Warfare III', genero: 'Tiro • Ação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2519060/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2519060/header.jpg',
    descricao: 'Entre em combates intensos na campanha e nos modos multiplayer.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#4C5476',
  },
  {
    id: 'call-of-duty-black-ops-iii', titulo: 'Call of Duty: Black Ops III', genero: 'Tiro • Ficção científica', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/311210/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/311210/header.jpg',
    descricao: 'Enfrente uma campanha futurista e jogue modos multiplayer e zumbis.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#6A473D',
  },
  {
    id: 'doom-eternal', titulo: 'DOOM Eternal', genero: 'Tiro • Ação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/782330/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/782330/header.jpg',
    descricao: 'Enfrente hordas demoníacas em combates velozes e intensos.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#496B75',
  },
  {
    id: 'red-dead-redemption', titulo: 'Red Dead Redemption', genero: 'Ação • Faroeste', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2668510/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2668510/header.jpg',
    descricao: 'Explore o Velho Oeste em uma história de foras da lei e redenção.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#68533A',
  },
  {
    id: 'grand-theft-auto-iv', titulo: 'Grand Theft Auto IV', genero: 'Ação • Mundo aberto', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/12210/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/12210/header.jpg',
    descricao: 'Acompanhe Niko Bellic em uma história criminal em Liberty City.', plataformas: ['PC', 'Xbox'], cor: '#4C6250',
  },
  {
    id: 'skyrim-special-edition', titulo: 'The Elder Scrolls V: Skyrim Special Edition', genero: 'RPG • Fantasia', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/489830/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/489830/header.jpg',
    descricao: 'Explore Skyrim, descubra masmorras e construa seu próprio herói.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#57435F',
  },
  {
    id: 'fallout-4', titulo: 'Fallout 4', genero: 'RPG • Pós-apocalíptico', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/377160/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/377160/header.jpg',
    descricao: 'Explore um mundo devastado, faça escolhas e construa assentamentos.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#405E6B',
  },
  {
    id: 'fallout-new-vegas', titulo: 'Fallout: New Vegas', genero: 'RPG • Pós-apocalíptico', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/22380/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/22380/header.jpg',
    descricao: 'Atravesse o deserto de Mojave e decida o destino de New Vegas.', plataformas: ['PC', 'Xbox'], cor: '#71503A',
  },
  {
    id: 'monster-hunter-world', titulo: 'Monster Hunter: World', genero: 'Ação • Caça', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/582010/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/582010/header.jpg',
    descricao: 'Rastreie monstros enormes, crie equipamentos e cace em equipe.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#3F6255',
  },
  {
    id: 'monster-hunter-rise', titulo: 'Monster Hunter Rise', genero: 'Ação • Caça', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1446780/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1446780/header.jpg',
    descricao: 'Enfrente monstros em caçadas ágeis com armas e estilos variados.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#66534A',
  },
  {
    id: 'final-fantasy-vii-remake', titulo: 'Final Fantasy VII Remake Intergrade', genero: 'RPG • Ação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1462040/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1462040/header.jpg',
    descricao: 'Reviva a aventura de Cloud em uma releitura moderna do clássico.', plataformas: ['PC', 'PS5'], cor: '#4C5476',
  },
  {
    id: 'final-fantasy-xiv-online', titulo: 'Final Fantasy XIV Online', genero: 'MMORPG • Fantasia', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/39210/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/39210/header.jpg',
    descricao: 'Aventure-se em um mundo online com missões, classes e raids.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#6A473D',
  },
  {
    id: 'final-fantasy-xv', titulo: 'Final Fantasy XV Windows Edition', genero: 'RPG • Aventura', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/637650/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/637650/header.jpg',
    descricao: 'Viaje com amigos por um reino fantástico em uma aventura épica.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#496B75',
  },
  {
    id: 'persona-5-royal', titulo: 'Persona 5 Royal', genero: 'RPG • JRPG', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1687950/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1687950/header.jpg',
    descricao: 'Viva a rotina escolar e lidere os Phantom Thieves em batalhas por turnos.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#68533A',
  },
  {
    id: 'persona-4-golden', titulo: 'Persona 4 Golden', genero: 'RPG • Mistério', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1113000/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1113000/header.jpg',
    descricao: 'Investigue uma série de mistérios e fortaleça laços com seus amigos.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#4C6250',
  },
  {
    id: 'nier-automata', titulo: 'NieR:Automata', genero: 'RPG • Ação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/524220/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/524220/header.jpg',
    descricao: 'Lute como androides em um mundo de ficção científica e dilemas filosóficos.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#57435F',
  },
  {
    id: 'sekiro-goty', titulo: 'Sekiro: Shadows Die Twice - GOTY Edition', genero: 'Ação • Samurai', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/814380/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/814380/header.jpg',
    descricao: 'Domine a espada e enfrente inimigos desafiadores no Japão feudal.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#405E6B',
  },
  {
    id: 'dark-souls-iii', titulo: 'Dark Souls III', genero: 'RPG • Ação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/374320/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/374320/header.jpg',
    descricao: 'Enfrente criaturas perigosas e explore um mundo sombrio e interligado.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#71503A',
  },
  {
    id: 'dark-souls-remastered', titulo: 'Dark Souls Remastered', genero: 'RPG • Ação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/570940/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/570940/header.jpg',
    descricao: 'Descubra Lordran e supere combates exigentes em um clássico moderno.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#3F6255',
  },
  {
    id: 'bloodborne', titulo: 'Bloodborne', genero: 'Ação • Terror gótico', nota: '8.8',
    imagem: '', imagemAlternativa: '',
    descricao: 'Explore Yharnam e enfrente criaturas em uma aventura gótica desafiadora.', plataformas: ['PS4'], cor: '#66534A',
  },
  {
    id: 'demons-souls', titulo: 'Demon’s Souls', genero: 'RPG • Ação', nota: '8.8',
    imagem: '', imagemAlternativa: '',
    descricao: 'Enfrente demônios em uma fantasia sombria de combates exigentes.', plataformas: ['PS5'], cor: '#4C5476',
  },
  {
    id: 'horizon-zero-dawn', titulo: 'Horizon Zero Dawn Complete Edition', genero: 'Ação • Mundo aberto', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1151640/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1151640/header.jpg',
    descricao: 'Caçe máquinas em um mundo selvagem com mistérios do passado.', plataformas: ['PC', 'PS4'], cor: '#6A473D',
  },
  {
    id: 'horizon-forbidden-west', titulo: 'Horizon Forbidden West Complete Edition', genero: 'Ação • Mundo aberto', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2420110/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2420110/header.jpg',
    descricao: 'Acompanhe Aloy em novas regiões e enfrente máquinas poderosas.', plataformas: ['PC', 'PS5'], cor: '#496B75',
  },
  {
    id: 'the-last-of-us-part-i', titulo: 'The Last of Us Part I', genero: 'Ação • Sobrevivência', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1888930/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1888930/header.jpg',
    descricao: 'Atravesse um mundo devastado em uma jornada de sobrevivência e laços humanos.', plataformas: ['PC', 'PS5'], cor: '#68533A',
  },
  {
    id: 'uncharted-legacy-of-thieves', titulo: 'Uncharted: Legacy of Thieves Collection', genero: 'Ação • Aventura', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1659420/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1659420/header.jpg',
    descricao: 'Acompanhe aventuras cinematográficas repletas de exploração e tesouros.', plataformas: ['PC', 'PS5'], cor: '#4C6250',
  },
  {
    id: 'detroit-become-human', titulo: 'Detroit: Become Human', genero: 'Aventura • Narrativa', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1222140/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1222140/header.jpg',
    descricao: 'Faça escolhas que mudam o destino de androides em uma história interativa.', plataformas: ['PC', 'PS4'], cor: '#57435F',
  },
  {
    id: 'heavy-rain', titulo: 'Heavy Rain', genero: 'Aventura • Suspense', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/960910/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/960910/header.jpg',
    descricao: 'Investigue um caso de desaparecimento em um suspense cheio de decisões.', plataformas: ['PC', 'PS4'], cor: '#405E6B',
  },
  {
    id: 'it-takes-two', titulo: 'It Takes Two', genero: 'Aventura • Cooperativo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1426210/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1426210/header.jpg',
    descricao: 'Resolva desafios cooperativos em uma aventura feita para duas pessoas.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#71503A',
  },
  {
    id: 'a-way-out', titulo: 'A Way Out', genero: 'Aventura • Cooperativo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1222700/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1222700/header.jpg',
    descricao: 'Ajude dois prisioneiros a escapar em uma aventura cooperativa.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#3F6255',
  },
  {
    id: 'lethal-company', titulo: 'Lethal Company', genero: 'Terror • Cooperativo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1966720/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1966720/header.jpg',
    descricao: 'Explore instalações abandonadas em busca de sucata com seus amigos.', plataformas: ['PC'], cor: '#66534A',
  },
  {
    id: 'phasmophobia', titulo: 'Phasmophobia', genero: 'Terror • Cooperativo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/739630/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/739630/header.jpg',
    descricao: 'Investigue locais assombrados e descubra qual entidade está presente.', plataformas: ['PC', 'PS5', 'Xbox'], cor: '#4C5476',
  },
  {
    id: 'dead-by-daylight', titulo: 'Dead by Daylight', genero: 'Terror • Multiplayer', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/381210/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/381210/header.jpg',
    descricao: 'Sobreviva como equipe ou persiga os sobreviventes como assassino.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#6A473D',
  },
  {
    id: 'the-forest', titulo: 'The Forest', genero: 'Sobrevivência • Terror', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/242760/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/242760/header.jpg',
    descricao: 'Construa abrigo e sobreviva em uma floresta cheia de perigos.', plataformas: ['PC', 'PS4'], cor: '#496B75',
  },
  {
    id: 'sons-of-the-forest', titulo: 'Sons of the Forest', genero: 'Sobrevivência • Terror', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1326470/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1326470/header.jpg',
    descricao: 'Explore uma ilha misteriosa, colete recursos e construa para sobreviver.', plataformas: ['PC'], cor: '#68533A',
  },
  {
    id: 'rust', titulo: 'Rust', genero: 'Sobrevivência • Multiplayer', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
    descricao: 'Colete recursos, construa bases e dispute território com outros jogadores.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#4C6250',
  },
  {
    id: 'ark-survival-evolved', titulo: 'ARK: Survival Evolved', genero: 'Sobrevivência • Dinossauros', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/346110/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/346110/header.jpg',
    descricao: 'Sobreviva em uma ilha repleta de dinossauros que podem ser domados.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#57435F',
  },
  {
    id: 'the-long-dark', titulo: 'The Long Dark', genero: 'Sobrevivência • Exploração', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/305620/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/305620/header.jpg',
    descricao: 'Gerencie recursos e enfrente o frio em uma natureza implacável.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#405E6B',
  },
  {
    id: 'subnautica', titulo: 'Subnautica', genero: 'Sobrevivência • Exploração', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/264710/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/264710/header.jpg',
    descricao: 'Explore um oceano alienígena, construa equipamentos e descubra seus segredos.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#71503A',
  },
  {
    id: 'raft', titulo: 'Raft', genero: 'Sobrevivência • Cooperativo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/648800/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/648800/header.jpg',
    descricao: 'Construa e amplie uma jangada enquanto sobrevive em alto-mar.', plataformas: ['PC'], cor: '#3F6255',
  },
  {
    id: 'valheim', titulo: 'Valheim', genero: 'Sobrevivência • Mitologia', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
    descricao: 'Explore um mundo inspirado na mitologia nórdica e construa seu lar viking.', plataformas: ['PC', 'Xbox'], cor: '#66534A',
  },
  {
    id: 'the-binding-of-isaac-rebirth', titulo: 'The Binding of Isaac: Rebirth', genero: 'Roguelike • Ação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/250900/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/250900/header.jpg',
    descricao: 'Enfrente salas e chefes aleatórios em partidas cheias de itens.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#4C5476',
  },
  {
    id: 'vampire-survivors', titulo: 'Vampire Survivors', genero: 'Roguelite • Sobrevivência', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1794680/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1794680/header.jpg',
    descricao: 'Derrote ondas de inimigos e combine armas para sobreviver.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch', 'Mobile'], cor: '#6A473D',
  },
  {
    id: 'balatro', titulo: 'Balatro', genero: 'Cartas • Estratégia', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2379780/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2379780/header.jpg',
    descricao: 'Combine pôquer e cartas especiais para criar pontuações cada vez maiores.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch', 'Mobile'], cor: '#496B75',
  },
  {
    id: 'undertale', titulo: 'Undertale', genero: 'RPG • Indie', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/391540/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/391540/header.jpg',
    descricao: 'Explore um mundo subterrâneo onde suas escolhas afetam os encontros.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#68533A',
  },
  {
    id: 'omori', titulo: 'OMORI', genero: 'RPG • Terror psicológico', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1150690/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1150690/header.jpg',
    descricao: 'Descubra um mundo surreal em uma aventura sobre amizade e emoções.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#4C6250',
  },
  {
    id: 'cuphead', titulo: 'Cuphead', genero: 'Plataforma • Ação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/268910/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/268910/header.jpg',
    descricao: 'Enfrente chefes difíceis com animação inspirada nos desenhos clássicos.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#57435F',
  },
  {
    id: 'ori-and-the-blind-forest', titulo: 'Ori and the Blind Forest', genero: 'Plataforma • Aventura', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/261570/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/261570/header.jpg',
    descricao: 'Explore um mundo encantado com plataformas precisas e trilha emocionante.', plataformas: ['PC', 'Xbox', 'Nintendo Switch'], cor: '#405E6B',
  },
  {
    id: 'ori-and-the-will-of-the-wisps', titulo: 'Ori and the Will of the Wisps', genero: 'Plataforma • Aventura', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1057090/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1057090/header.jpg',
    descricao: 'Acompanhe Ori em uma jornada visualmente marcante e cheia de desafios.', plataformas: ['PC', 'Xbox', 'Nintendo Switch'], cor: '#71503A',
  },
  {
    id: 'euro-truck-simulator-2', titulo: 'Euro Truck Simulator 2', genero: 'Simulação • Caminhões', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/227300/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/227300/header.jpg',
    descricao: 'Dirija caminhões por estradas europeias, entregue cargas e expanda sua empresa.', plataformas: ['PC'], cor: '#3F6255',
  },
  {
    id: 'american-truck-simulator', titulo: 'American Truck Simulator', genero: 'Simulação • Caminhões', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/270880/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/270880/header.jpg',
    descricao: 'Faça entregas pelas rodovias dos Estados Unidos e gerencie sua frota.', plataformas: ['PC'], cor: '#66534A',
  },
  {
    id: 'f1-25', titulo: 'F1 25', genero: 'Corrida • Fórmula 1', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/3059520/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/3059520/header.jpg',
    descricao: 'Dispute corridas de Fórmula 1 e gerencie sua carreira no automobilismo.', plataformas: ['PC', 'PS5', 'Xbox'], cor: '#4C5476',
  },
  {
    id: 'assetto-corsa', titulo: 'Assetto Corsa', genero: 'Corrida • Simulação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/244210/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/244210/header.jpg',
    descricao: 'Pilote carros licenciados em pistas com foco na simulação.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#6A473D',
  },
  {
    id: 'need-for-speed-heat', titulo: 'Need for Speed Heat', genero: 'Corrida • Rua', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1222680/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1222680/header.jpg',
    descricao: 'Corra de dia e à noite, personalize carros e fuja da polícia.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#496B75',
  },
  {
    id: 'the-crew-2', titulo: 'The Crew 2', genero: 'Corrida • Mundo aberto', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/646910/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/646910/header.jpg',
    descricao: 'Explore os Estados Unidos em carros, motos, barcos e aeronaves.', plataformas: ['PC', 'PS4', 'Xbox'], cor: '#68533A',
  },
  {
    id: 'trackmania', titulo: 'Trackmania', genero: 'Corrida • Competitivo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2225070/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2225070/header.jpg',
    descricao: 'Supere pistas rápidas com saltos, curvas e desafios contra o relógio.', plataformas: ['PC', 'PS5', 'Xbox'], cor: '#4C6250',
  },
  {
    id: 'rocket-league', titulo: 'Rocket League', genero: 'Esporte • Carros', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/252950/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/252950/header.jpg',
    descricao: 'Jogue futebol com carros turbinados em partidas rápidas e competitivas.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#57435F',
  },
  {
    id: 'ea-sports-fc-25', titulo: 'EA SPORTS FC 25', genero: 'Esporte • Futebol', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2669320/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2669320/header.jpg',
    descricao: 'Monte seu time e dispute partidas de futebol em vários modos.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#405E6B',
  },
  {
    id: 'efootball', titulo: 'eFootball', genero: 'Esporte • Futebol', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1665460/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1665460/header.jpg',
    descricao: 'Monte sua equipe e participe de partidas de futebol online.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Mobile'], cor: '#71503A',
  },
  {
    id: 'nba-2k25', titulo: 'NBA 2K25', genero: 'Esporte • Basquete', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2878980/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2878980/header.jpg',
    descricao: 'Crie seu jogador e dispute partidas e temporadas de basquete.', plataformas: ['PC', 'PS5', 'Xbox'], cor: '#3F6255',
  },
  {
    id: 'wwe-2k24', titulo: 'WWE 2K24', genero: 'Luta • Esporte', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2315690/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2315690/header.jpg',
    descricao: 'Entre no ringue com estrelas do wrestling e vários tipos de luta.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#66534A',
  },
  {
    id: 'street-fighter-6', titulo: 'Street Fighter 6', genero: 'Luta • Competitivo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1364780/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1364780/header.jpg',
    descricao: 'Domine golpes e combos em lutas clássicas com mecânicas modernas.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#4C5476',
  },
  {
    id: 'tekken-8', titulo: 'Tekken 8', genero: 'Luta • Competitivo', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1778820/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1778820/header.jpg',
    descricao: 'Escolha seu lutador e enfrente rivais em combates 3D intensos.', plataformas: ['PC', 'PS5', 'Xbox'], cor: '#6A473D',
  },
  {
    id: 'mortal-kombat-11', titulo: 'Mortal Kombat 11', genero: 'Luta • Ação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/976310/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/976310/header.jpg',
    descricao: 'Dispute combates brutais com personagens e golpes especiais.', plataformas: ['PC', 'PS4', 'Xbox', 'Nintendo Switch'], cor: '#496B75',
  },
  {
    id: 'guilty-gear-strive', titulo: 'Guilty Gear -Strive-', genero: 'Luta • Anime', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1384160/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1384160/header.jpg',
    descricao: 'Lute com personagens estilizados em combates técnicos e velozes.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#68533A',
  },
  {
    id: 'overwatch-2', titulo: 'Overwatch 2', genero: 'Tiro • Heróis', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/2357570/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/2357570/header.jpg',
    descricao: 'Escolha um herói e coopere com sua equipe em partidas por objetivos.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#4C6250',
  },
  {
    id: 'warframe', titulo: 'Warframe', genero: 'Ação • Cooperação', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/230410/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/230410/header.jpg',
    descricao: 'Controle um guerreiro espacial em missões cooperativas e combates ágeis.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch'], cor: '#57435F',
  },
  {
    id: 'destiny-2', titulo: 'Destiny 2', genero: 'Tiro • MMO', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1085660/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/1085660/header.jpg',
    descricao: 'Explore o sistema solar em missões, raids e confrontos competitivos.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#405E6B',
  },
  {
    id: 'war-thunder', titulo: 'War Thunder', genero: 'Simulação • Combate', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/236390/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/236390/header.jpg',
    descricao: 'Pilote aviões, tanques e veículos navais em batalhas online.', plataformas: ['PC', 'PS4', 'PS5', 'Xbox'], cor: '#71503A',
  },
  {
    id: 'world-of-tanks-blitz', titulo: 'World of Tanks Blitz', genero: 'Ação • Tanques', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/444200/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/444200/header.jpg',
    descricao: 'Comande tanques em batalhas táticas curtas contra outros jogadores.', plataformas: ['PC', 'Mobile'], cor: '#3F6255',
  },
  {
    id: 'age-of-empires-ii-definitive', titulo: 'Age of Empires II: Definitive Edition', genero: 'Estratégia • História', nota: '8.8',
    imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/813780/library_600x900.jpg', imagemAlternativa: 'https://cdn.akamai.steamstatic.com/steam/apps/813780/header.jpg',
    descricao: 'Construa civilizações, reúna recursos e vença batalhas históricas.', plataformas: ['PC', 'Xbox'], cor: '#66534A',
  },

];

const categoriasReview = ['Gameplay', 'História', 'Gráficos', 'Trilha sonora', 'Desempenho', 'Diversão'];

function CapaJogo({
  jogo,
  style,
}: {
  jogo: Jogo;
  style: object;
}) {
  const [tentativaImagem, setTentativaImagem] = useState(0);

  return (
    <View style={[styles.capaBase, { backgroundColor: jogo.cor }, style]}>
      {tentativaImagem < 2 ? (
        <Image
          source={{ uri: tentativaImagem === 0 ? jogo.imagem : jogo.imagemAlternativa }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setTentativaImagem((atual) => atual + 1)}
        />
      ) : (
        <View style={styles.capaFallback}>
          <Text style={styles.fallbackMarca}>DUCKLIST</Text>
          <Text style={styles.fallbackTitulo}>{jogo.titulo}</Text>
          <Text style={styles.fallbackGenero}>{jogo.genero}</Text>
        </View>
      )}
    </View>
  );
}

function Botao({
  titulo,
  onPress,
  secundario = false,
  disabled = false,
}: {
  titulo: string;
  onPress: () => void;
  secundario?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.botao,
        secundario && styles.botaoSecundario,
        disabled && styles.botaoDesabilitado,
      ]}
    >
      <Text style={[styles.botaoTexto, secundario && styles.botaoTextoSecundario]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

export default function Index() {
  const { width: larguraTela } = useWindowDimensions();
  const colunas = larguraTela >= 1100 ? 4 : larguraTela >= 720 ? 3 : 2;
  const [carregando, setCarregando] = useState(true);
  const [jogosCatalogo, setJogosCatalogo] = useState<Jogo[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [aba, setAba] = useState<Aba>('home');
  const [busca, setBusca] = useState('');
  const [plataforma, setPlataforma] = useState('Todas');
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selecionado, setSelecionado] = useState<Jogo | null>(null);
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [nota, setNota] = useState(4);
  const [tags, setTags] = useState<string[]>(['Gameplay']);
  const [recomendaria, setRecomendaria] = useState(true);
  const [textoReview, setTextoReview] = useState('');
  const [erroReview, setErroReview] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        // Banco local persistente. Na primeira abertura, o catálogo inicial é
        // importado uma única vez; nas próximas, os jogos vêm do SQLite.
        const db = await SQLite.openDatabaseAsync('ducklist.db');
        await db.execAsync(`
          PRAGMA journal_mode = WAL;
          PRAGMA foreign_keys = ON;
          CREATE TABLE IF NOT EXISTS jogos (
            id TEXT PRIMARY KEY NOT NULL,
            titulo TEXT NOT NULL,
            genero TEXT,
            nota REAL,
            descricao TEXT,
            plataformas_json TEXT NOT NULL DEFAULT '[]',
            cor TEXT
          );
          CREATE TABLE IF NOT EXISTS imagens_jogos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jogo_id TEXT NOT NULL REFERENCES jogos(id) ON DELETE CASCADE,
            tipo TEXT NOT NULL CHECK (tipo IN ('capa_vertical', 'capa_horizontal')),
            url TEXT NOT NULL,
            UNIQUE(jogo_id, tipo)
          );
          CREATE INDEX IF NOT EXISTS idx_jogos_titulo ON jogos(titulo);
          CREATE INDEX IF NOT EXISTS idx_jogos_genero ON jogos(genero);
        `);

        const total = await db.getFirstAsync<{ total: number }>(
          'SELECT COUNT(*) AS total FROM jogos'
        );
        if (!total || total.total === 0) {
          for (const jogo of jogos) {
            await db.runAsync(
              'INSERT OR IGNORE INTO jogos (id, titulo, genero, nota, descricao, plataformas_json, cor) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [jogo.id, jogo.titulo, jogo.genero, Number(jogo.nota), jogo.descricao, JSON.stringify(jogo.plataformas), jogo.cor],
            );
            if (jogo.imagem) {
              await db.runAsync(
                'INSERT OR IGNORE INTO imagens_jogos (jogo_id, tipo, url) VALUES (?, ?, ?)',
                [jogo.id, 'capa_vertical', jogo.imagem],
              );
            }
            if (jogo.imagemAlternativa) {
              await db.runAsync(
                'INSERT OR IGNORE INTO imagens_jogos (jogo_id, tipo, url) VALUES (?, ?, ?)',
                [jogo.id, 'capa_horizontal', jogo.imagemAlternativa],
              );
            }
          }
        }

        const registros = await db.getAllAsync<{
          id: string; titulo: string; genero: string; nota: number;
          descricao: string; plataformas_json: string; cor: string;
          imagem: string | null; imagemAlternativa: string | null;
        }>(`
          SELECT j.id, j.titulo, j.genero, j.nota, j.descricao,
                 j.plataformas_json, j.cor,
                 iv.url AS imagem, ih.url AS imagemAlternativa
          FROM jogos j
          LEFT JOIN imagens_jogos iv
            ON iv.jogo_id = j.id AND iv.tipo = 'capa_vertical'
          LEFT JOIN imagens_jogos ih
            ON ih.jogo_id = j.id AND ih.tipo = 'capa_horizontal'
          ORDER BY j.titulo COLLATE NOCASE
        `);
        setJogosCatalogo(registros.map((item) => ({
          id: item.id,
          titulo: item.titulo,
          genero: item.genero ?? '',
          nota: String(item.nota ?? ''),
          descricao: item.descricao ?? '',
          plataformas: JSON.parse(item.plataformas_json || '[]') as string[],
          cor: item.cor || '#394D5C',
          imagem: item.imagem || '',
          imagemAlternativa: item.imagemAlternativa || '',
        })));

        const [usuarioSalvo, favoritosSalvos, reviewsSalvos] = await Promise.all([
          AsyncStorage.getItem(CHAVE_USUARIO),
          AsyncStorage.getItem(CHAVE_FAVORITOS),
          AsyncStorage.getItem(CHAVE_REVIEWS),
        ]);
        if (usuarioSalvo) setUsuario(JSON.parse(usuarioSalvo) as Usuario);
        if (favoritosSalvos) setFavoritos(JSON.parse(favoritosSalvos) as string[]);
        if (reviewsSalvos) setReviews(JSON.parse(reviewsSalvos) as Review[]);
      } catch (erro) {
        console.warn('Erro ao inicializar o banco Ducklist:', erro);
        setMensagem('Não foi possível carregar o catálogo. Verifique se expo-sqlite está instalado.');
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const jogosFiltrados = jogosCatalogo.filter((jogo) => {
    const combinaBusca =
      jogo.titulo.toLowerCase().includes(busca.trim().toLowerCase()) ||
      jogo.genero.toLowerCase().includes(busca.trim().toLowerCase());
    const combinaPlataforma =
      plataforma === 'Todas' || jogo.plataformas.includes(plataforma);
    return combinaBusca && combinaPlataforma;
  });

  async function entrar() {
    setErroLogin('');
    const emailLimpo = email.trim().toLowerCase();
    const nomeLimpo = nome.trim();

    if (!emailLimpo || !emailLimpo.includes('@') || !emailLimpo.includes('.')) {
      setErroLogin('Digite um e-mail válido.');
      return;
    }
    if (senha.trim().length < 4) {
      setErroLogin('Use uma senha com pelo menos 4 caracteres.');
      return;
    }

    const novoUsuario: Usuario = {
      nome: nomeLimpo || emailLimpo.split('@')[0],
      email: emailLimpo,
    };

    try {
      await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(novoUsuario));
      setUsuario(novoUsuario);
      setAba('home');
      setSenha('');
      setMensagem(`Bem-vindo(a), ${novoUsuario.nome}!`);
    } catch {
      setErroLogin('Não foi possível salvar o perfil neste dispositivo.');
    }
  }

  async function sair() {
    try {
      await AsyncStorage.removeItem(CHAVE_USUARIO);
      setUsuario(null);
      setSelecionado(null);
      setAba('home');
      setMensagem('');
    } catch {
      setMensagem('Não foi possível sair agora. Tente novamente.');
    }
  }

  async function alternarFavorito(id: string) {
    const novaLista = favoritos.includes(id)
      ? favoritos.filter((favorito) => favorito !== id)
      : [...favoritos, id];
    setFavoritos(novaLista);
    try {
      await AsyncStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(novaLista));
    } catch {
      setMensagem('Não foi possível salvar seus favoritos.');
    }
  }

  function alternarTag(tag: string) {
    setTags((atuais) =>
      atuais.includes(tag) ? atuais.filter((item) => item !== tag) : [...atuais, tag],
    );
  }

  async function publicarReview() {
    setErroReview('');
    if (!usuario) {
      setErroReview('Entre pelo botão Perfil para publicar uma avaliação.');
      return;
    }
    if (!selecionado) return;
    if (textoReview.trim().length < 10) {
      setErroReview('Conte um pouco mais: escreva pelo menos 10 caracteres.');
      return;
    }

    const novaReview: Review = {
      id: `${Date.now()}-${selecionado.id}`,
      jogoId: selecionado.id,
      usuario: usuario.nome,
      nota,
      tags,
      recomendaria,
      texto: textoReview.trim(),
      data: new Date().toLocaleDateString('pt-BR'),
    };
    const novasReviews = [novaReview, ...reviews];
    setReviews(novasReviews);
    try {
      await AsyncStorage.setItem(CHAVE_REVIEWS, JSON.stringify(novasReviews));
      setTextoReview('');
      setNota(4);
      setTags(['Gameplay']);
      setRecomendaria(true);
      setMensagem('Sua avaliação foi publicada!');
    } catch {
      setErroReview('Não foi possível salvar sua avaliação. Tente novamente.');
      setReviews(reviews);
    }
  }

  function voltarParaHome() {
    setSelecionado(null);
    setAba('home');
    setBusca('');
    setMensagem('');
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.carregando}>
        <StatusBar barStyle="light-content" backgroundColor="#171715" />
        <ActivityIndicator size="large" color="#E99555" />
        <Text style={styles.textoCarregando}>Preparando seu universo gamer...</Text>
      </SafeAreaView>
    );
  }

  if (!usuario && aba === 'perfil') {
    return (
      <SafeAreaView style={styles.tela}>
        <StatusBar barStyle="light-content" backgroundColor="#171715" />
        <KeyboardAvoidingView
          style={styles.loginCentro}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.loginConteudo} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={voltarParaHome} activeOpacity={0.8}>
              <Text style={styles.logo}>duck<Text style={styles.laranja}>list</Text><Text style={styles.laranja}>.</Text></Text>
            </TouchableOpacity>
            <View style={styles.loginSelo}>
              <Text style={styles.loginEmoji}>🎮</Text>
            </View>
            <Text style={styles.loginTitulo}>Seu espaço gamer.</Text>
            <Text style={styles.loginDescricao}>Entre para guardar favoritos e compartilhar suas opiniões sobre os jogos.</Text>

            <Text style={styles.label}>Como podemos te chamar?</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome ou apelido"
              placeholderTextColor="#858585"
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="voce@exemplo.com"
              placeholderTextColor="#858585"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              placeholder="Pelo menos 4 caracteres"
              placeholderTextColor="#858585"
              style={styles.input}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={entrar}
            />
            {erroLogin ? <Text style={styles.erro}>{erroLogin}</Text> : null}
            <Botao titulo="Entrar / criar perfil" onPress={entrar} />
            <Text style={styles.avisoLogin}>Protótipo: o perfil fica salvo neste dispositivo. Ainda não há autenticação real por servidor.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const reviewsDoJogo = selecionado
    ? reviews.filter((review) => review.jogoId === selecionado.id)
    : [];
  const mediaReviews = reviewsDoJogo.length
    ? reviewsDoJogo.reduce((soma, review) => soma + review.nota, 0) / reviewsDoJogo.length
    : null;

  return (
    <SafeAreaView style={styles.tela}>
      <StatusBar barStyle="light-content" backgroundColor="#171715" />
      <View style={styles.topo}>
        <TouchableOpacity onPress={voltarParaHome} accessibilityRole="button" activeOpacity={0.8}>
          <Text style={styles.logo}>duck<Text style={styles.laranja}>list</Text><Text style={styles.laranja}>.</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatar} onPress={() => { setSelecionado(null); setAba('perfil'); }} accessibilityRole="button">
          <Text style={styles.avatarTexto}>{usuario ? usuario.nome.slice(0, 1).toUpperCase() : '↗'}</Text>
        </TouchableOpacity>
      </View>

      {mensagem ? (
        <TouchableOpacity onPress={() => setMensagem('')} style={styles.mensagem}>
          <Text style={styles.mensagemTexto}>{mensagem}  ×</Text>
        </TouchableOpacity>
      ) : null}

      {selecionado ? (
        <ScrollView contentContainerStyle={styles.conteudo}>
          <TouchableOpacity style={styles.voltar} onPress={voltarParaHome}>
            <Text style={styles.voltarTexto}>← Início / catálogo</Text>
          </TouchableOpacity>
          <CapaJogo jogo={selecionado} style={styles.imagemDetalhe} />
          <Text style={styles.tituloDetalhe}>{selecionado.titulo}</Text>
          <Text style={styles.genero}>{selecionado.genero}</Text>
          <View style={styles.linhaNota}>
            <Text style={styles.notaDestaque}>★ {selecionado.nota}/10</Text>
            {mediaReviews !== null ? (
              <Text style={styles.mediaComunidade}>Sua comunidade: {mediaReviews.toFixed(1)}/5</Text>
            ) : null}
          </View>
          <Text style={styles.descricao}>{selecionado.descricao}</Text>
          <View style={styles.plataformasLinha}>
            {selecionado.plataformas.map((item) => (
              <Text key={item} style={styles.plataformaPill}>{item}</Text>
            ))}
          </View>
          <View style={styles.linhaBotoes}>
            <View style={styles.botaoFlex}>
              <Botao
                titulo={favoritos.includes(selecionado.id) ? '♥ Nos favoritos' : '♡ Favoritar jogo'}
                onPress={() => alternarFavorito(selecionado.id)}
                secundario
              />
            </View>
          </View>

          <View style={styles.separador} />
          <Text style={styles.tituloSecao}>Sua avaliação</Text>
          <Text style={styles.textoAjuda}>Dê sua nota e conte à comunidade o que fez esse jogo valer (ou não) a pena.</Text>
          <Text style={styles.label}>Sua nota: {nota}/5</Text>
          <View style={styles.estrelas}>
            {[1, 2, 3, 4, 5].map((valor) => (
              <TouchableOpacity
                key={valor}
                accessibilityRole="button"
                accessibilityLabel={`Dar ${valor} de 5 estrelas`}
                onPress={() => setNota(valor)}
                style={styles.estrelaBotao}
              >
                <Text style={[styles.estrela, valor <= nota && styles.estrelaAtiva]}>{valor <= nota ? '★' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>O que mais chamou sua atenção?</Text>
          <View style={styles.tags}>
            {categoriasReview.map((tag) => {
              const ativa = tags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => alternarTag(tag)}
                  style={[styles.tag, ativa && styles.tagAtiva]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.tagTexto, ativa && styles.tagTextoAtiva]}>{ativa ? '✓ ' : '+ '}{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Você recomendaria esse jogo?</Text>
          <View style={styles.linhaBotoes}>
            <View style={styles.botaoFlex}>
              <Botao titulo="👍 Sim, recomendo" onPress={() => setRecomendaria(true)} secundario={!recomendaria} />
            </View>
            <View style={styles.botaoFlex}>
              <Botao titulo="👎 Não recomendo" onPress={() => setRecomendaria(false)} secundario={recomendaria} />
            </View>
          </View>

          <Text style={styles.label}>Sua opinião</Text>
          <TextInput
            style={[styles.input, styles.inputReview]}
            value={textoReview}
            onChangeText={setTextoReview}
            placeholder="Fale sobre a experiência, os pontos fortes e o que poderia melhorar..."
            placeholderTextColor="#858585"
            multiline
            textAlignVertical="top"
            maxLength={800}
          />
          <Text style={styles.contadorTexto}>{textoReview.length}/800 caracteres · mínimo 10</Text>
          {erroReview ? <Text style={styles.erro}>{erroReview}</Text> : null}
          <Botao titulo="Publicar avaliação" onPress={publicarReview} />

          <View style={styles.separador} />
          <Text style={styles.tituloSecao}>Avaliações da comunidade</Text>
          {reviewsDoJogo.length === 0 ? (
            <Text style={styles.textoVazio}>Ainda não há avaliações salvas para este jogo. Você pode ser o primeiro!</Text>
          ) : (
            reviewsDoJogo.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTopo}>
                  <Text style={styles.reviewAutor}>{review.usuario}</Text>
                  <Text style={styles.reviewData}>{review.data}</Text>
                </View>
                <Text style={styles.reviewNota}>{'★'.repeat(review.nota)}{'☆'.repeat(5 - review.nota)}  {review.nota}/5</Text>
                {review.tags.length ? <Text style={styles.reviewTags}>{review.tags.join(' · ')}</Text> : null}
                <Text style={styles.reviewTexto}>{review.texto}</Text>
                <Text style={styles.reviewRecomendacao}>{review.recomendaria ? '👍 Recomenda este jogo' : '👎 Não recomenda este jogo'}</Text>
              </View>
            ))
          )}
        </ScrollView>
      ) : aba === 'favoritos' ? (
        <ScrollView contentContainerStyle={styles.conteudo}>
          <Text style={styles.tituloSecao}>Seus jogos favoritos</Text>
          <Text style={styles.textoAjuda}>Todos os jogos que você guardou ficam reunidos aqui.</Text>
          {favoritos.length === 0 ? (
            <Text style={styles.textoVazio}>Você ainda não favoritou nenhum jogo. Toque no coração de um jogo no catálogo para adicioná-lo.</Text>
          ) : favoritos.map((id) => {
            const jogo = jogosCatalogo.find((item) => item.id === id);
            if (!jogo) return null;
            return (
              <View key={jogo.id} style={styles.favoritoItem}>
                <TouchableOpacity style={styles.favoritoPrincipal} onPress={() => setSelecionado(jogo)} accessibilityRole="button">
                  <Text style={styles.favoritoNome}>♥  {jogo.titulo}</Text>
                  <Text style={styles.favoritoNota}>★ {jogo.nota}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => alternarFavorito(jogo.id)} style={styles.removerFavorito} accessibilityRole="button">
                  <Text style={styles.removerFavoritoTexto}>Remover</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      ) : aba === 'perfil' ? (
        <ScrollView contentContainerStyle={styles.conteudo}>
          <Text style={styles.tituloSecao}>Seu perfil</Text>
          <View style={styles.perfilCard}>
            <View style={styles.avatarGrande}><Text style={styles.avatarGrandeTexto}>{usuario?.nome.slice(0, 1).toUpperCase()}</Text></View>
            <Text style={styles.tituloDetalhe}>{usuario?.nome}</Text>
            <Text style={styles.genero}>{usuario?.email}</Text>
            <Text style={styles.textoAjuda}>{favoritos.length} jogo(s) favorito(s) · {reviews.filter((r) => r.usuario === usuario?.nome).length} avaliação(ões)</Text>
          </View>
          <Botao titulo="Voltar para o início" onPress={voltarParaHome} secundario />
          <View style={styles.espaco} />
          <Botao titulo="Sair da conta neste dispositivo" onPress={sair} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.conteudo}>
          <View style={styles.banner}>
            <Text style={styles.bannerEtiqueta}>SEU UNIVERSO GAMER</Text>
            <Text style={styles.bannerTitulo}>Jogue. Avalie.{"\n"}<Text style={styles.laranja}>Descubra.</Text></Text>
            <Text style={styles.bannerDescricao}>{usuario ? `Olá, ${usuario.nome}. Encontre seu próximo jogo favorito.` : 'Explore jogos, descubra novos favoritos e compartilhe suas opiniões.'}</Text>
          </View>

          <Text style={styles.tituloSecao}>Descubra jogos</Text>
          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar por jogo ou gênero..."
            placeholderTextColor="#858585"
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
            {['Todas', 'PC', 'PS4', 'PS5', 'Xbox', 'Nintendo Switch', 'Mobile'].map((item) => (
              <TouchableOpacity key={item} onPress={() => setPlataforma(item)} style={[styles.filtro, plataforma === item && styles.filtroAtivo]}>
                <Text style={[styles.filtroTexto, plataforma === item && styles.filtroTextoAtivo]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.cabecalhoSecao}>
            <Text style={styles.tituloSecao}>Catálogo</Text>
            <Text style={styles.contador}>{jogosFiltrados.length} jogo(s)</Text>
          </View>
          {jogosFiltrados.length === 0 ? (
            <Text style={styles.textoVazio}>Não encontramos jogos com esses filtros. Tente outra busca.</Text>
          ) : (
            <View style={styles.grade}>
              {jogosFiltrados.map((jogo) => (
                <View key={jogo.id} style={[styles.cardJogo, { width: `${100 / colunas - 2}%`, flexBasis: `${100 / colunas - 2}%` }]}>
                  <TouchableOpacity onPress={() => setSelecionado(jogo)} activeOpacity={0.85} accessibilityRole="button">
                    <CapaJogo jogo={jogo} style={styles.imagemJogo} />
                    <View style={styles.infoJogo}>
                      <Text style={styles.nomeJogo} numberOfLines={1}>{jogo.titulo}</Text>
                      <Text style={styles.generoCard} numberOfLines={1}>{jogo.genero}</Text>
                      <Text style={styles.verDetalhes}>Ver detalhes →</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.coracao} onPress={() => alternarFavorito(jogo.id)} accessibilityRole="button">
                    <Text style={styles.coracaoTexto}>{favoritos.includes(jogo.id) ? '♥' : '♡'}</Text>
                  </TouchableOpacity>
                  <View style={styles.notaBadge}><Text style={styles.notaBadgeTexto}>★ {jogo.nota}</Text></View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.separador} />
          <View style={styles.cabecalhoSecao}>
            <Text style={styles.tituloSecao}>Seus favoritos</Text>
            <Text style={styles.contador}>{favoritos.length}</Text>
          </View>
          {favoritos.length === 0 ? (
            <Text style={styles.textoVazio}>Toque no coração de um jogo para guardá-lo aqui.</Text>
          ) : (
            favoritos.map((id) => {
              const jogo = jogosCatalogo.find((item) => item.id === id);
              if (!jogo) return null;
              return (
                <View key={jogo.id} style={styles.favoritoItem}>
                  <TouchableOpacity style={styles.favoritoPrincipal} onPress={() => setSelecionado(jogo)}>
                    <Text style={styles.favoritoNome}>♥  {jogo.titulo}</Text>
                    <Text style={styles.favoritoNota}>★ {jogo.nota}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => alternarFavorito(jogo.id)} style={styles.removerFavorito}>
                    <Text style={styles.removerFavoritoTexto}>Remover</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
          <Text style={styles.rodape}>DUCKLIST © 2026 · FEITO PARA QUEM JOGA</Text>
        </ScrollView>
      )}

      {!selecionado && (
        <View style={styles.navegacao}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ir para a página inicial" style={styles.navItem} onPress={voltarParaHome}>
            <Text style={[styles.navIcone, aba === 'home' && styles.navAtivo]}>⌂</Text>
            <Text style={[styles.navTexto, aba === 'home' && styles.navAtivo]}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Abrir favoritos" style={styles.navItem} onPress={() => { setSelecionado(null); setAba('favoritos'); setMensagem(''); }}>
            <Text style={[styles.navIcone, aba === 'favoritos' && styles.navAtivo]}>♡</Text>
            <Text style={[styles.navTexto, aba === 'favoritos' && styles.navAtivo]}>Favoritos</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Abrir perfil" style={styles.navItem} onPress={() => { setSelecionado(null); setAba('perfil'); setMensagem(''); }}>
            <Text style={[styles.navIcone, aba === 'perfil' && styles.navAtivo]}>◉</Text>
            <Text style={[styles.navTexto, aba === 'perfil' && styles.navAtivo]}>Perfil</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#171715' },
  carregando: { flex: 1, backgroundColor: '#171715', alignItems: 'center', justifyContent: 'center' },
  textoCarregando: { color: '#C2BEB7', marginTop: 14, fontSize: 13 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#302F2A' },
  logo: { color: '#F5F2ED', fontSize: 30, fontWeight: '900', letterSpacing: -1.5 },
  laranja: { color: '#E99555' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D97732', alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: '#171715', fontWeight: '900', fontSize: 17 },
  conteudo: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  loginCentro: { flex: 1, justifyContent: 'center' },
  loginConteudo: { paddingHorizontal: 26, paddingTop: 24, paddingBottom: 40, justifyContent: 'center', flexGrow: 1 },
  loginSelo: { width: 76, height: 76, borderRadius: 24, backgroundColor: '#30271F', borderWidth: 1, borderColor: '#6A4328', alignItems: 'center', justifyContent: 'center', marginTop: 32, marginBottom: 22 },
  loginEmoji: { fontSize: 34 },
  loginTitulo: { color: '#F5F2ED', fontSize: 30, fontWeight: '900', marginBottom: 8 },
  loginDescricao: { color: '#A6A19A', fontSize: 14, lineHeight: 21, marginBottom: 28 },
  label: { color: '#C2BEB7', fontSize: 12, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  input: { backgroundColor: '#232320', color: '#F5F2ED', borderColor: '#3A3A34', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14 },
  inputBusca: { backgroundColor: '#232320', color: '#F5F2ED', borderColor: '#353530', borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, fontSize: 14, marginBottom: 12 },
  inputReview: { minHeight: 130, marginTop: 2 },
  avisoLogin: { color: '#77736D', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 16 },
  erro: { color: '#FF8A80', fontSize: 12, marginTop: 10, marginBottom: 6, lineHeight: 18 },
  botao: { backgroundColor: '#D97732', paddingVertical: 15, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 12, marginTop: 14, minHeight: 48 },
  botaoSecundario: { backgroundColor: '#30271F', borderWidth: 1, borderColor: '#6A4328' },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto: { color: '#171715', fontWeight: '900', fontSize: 13, textAlign: 'center' },
  botaoTextoSecundario: { color: '#E99555' },
  mensagem: { marginHorizontal: 20, marginTop: 10, padding: 10, backgroundColor: '#26372B', borderRadius: 8 },
  mensagemTexto: { color: '#C6F6D5', fontSize: 12 },
  banner: { backgroundColor: '#24231F', borderColor: '#3A3026', borderWidth: 1, borderRadius: 18, padding: 24, marginBottom: 28 },
  bannerEtiqueta: { color: '#D97732', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 15 },
  bannerTitulo: { color: '#F5F2ED', fontSize: 35, lineHeight: 42, fontWeight: '900', letterSpacing: -1 },
  bannerDescricao: { color: '#A6A19A', fontSize: 13, marginTop: 12, lineHeight: 20 },
  tituloSecao: { color: '#F5F2ED', fontSize: 21, fontWeight: '800', marginBottom: 12 },
  textoAjuda: { color: '#99958F', fontSize: 13, lineHeight: 20, marginBottom: 8 },
  cabecalhoSecao: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12 },
  contador: { color: '#99958F', fontSize: 12 },
  filtros: { gap: 8, paddingBottom: 20 },
  filtro: { borderWidth: 1, borderColor: '#3A3A34', paddingVertical: 9, paddingHorizontal: 13, borderRadius: 20, backgroundColor: '#22221F' },
  filtroAtivo: { backgroundColor: '#D97732', borderColor: '#D97732' },
  filtroTexto: { color: '#C2BEB7', fontSize: 12, fontWeight: '700' },
  filtroTextoAtivo: { color: '#171715' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cardJogo: { flexGrow: 0, overflow: 'hidden', backgroundColor: '#22221F', borderRadius: 14, borderWidth: 1, borderColor: '#34342F', marginBottom: 5, position: 'relative' },
  capaBase: { overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imagemJogo: { width: '100%', height: 190 },
  capaFallback: { flex: 1, width: '100%', minHeight: 140, alignItems: 'center', justifyContent: 'center', padding: 14, backgroundColor: 'rgba(0,0,0,0.12)' },
  fallbackMarca: { color: '#E99555', fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 16 },
  fallbackTitulo: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  fallbackGenero: { color: '#F5F2ED', fontSize: 10, textAlign: 'center', marginTop: 8 },
  infoJogo: { padding: 12, paddingTop: 10 },
  nomeJogo: { color: '#F5F2ED', fontSize: 14, fontWeight: '800', marginBottom: 5 },
  generoCard: { color: '#99958F', fontSize: 10, marginBottom: 12 },
  verDetalhes: { color: '#E99555', fontSize: 11, fontWeight: '700' },
  coracao: { position: 'absolute', top: 9, right: 9, backgroundColor: '#171715E8', width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  coracaoTexto: { color: '#E99555', fontSize: 21 },
  notaBadge: { position: 'absolute', top: 157, left: 9, backgroundColor: '#171715E8', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 },
  notaBadgeTexto: { color: '#E99555', fontSize: 12, fontWeight: '800' },
  separador: { height: 1, backgroundColor: '#34342F', marginVertical: 26 },
  textoVazio: { color: '#99958F', fontSize: 13, lineHeight: 21, marginBottom: 22 },
  favoritoItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#22221F', borderWidth: 1, borderColor: '#34342F', borderRadius: 10, marginBottom: 9, gap: 10 },
  favoritoPrincipal: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  favoritoNome: { color: '#F5F2ED', fontSize: 13, fontWeight: '700', flexShrink: 1 },
  favoritoNota: { color: '#E99555', fontSize: 12, fontWeight: '800', marginLeft: 8 },
  removerFavorito: { padding: 6 },
  removerFavoritoTexto: { color: '#E99555', fontSize: 11, fontWeight: '700' },
  rodape: { textAlign: 'center', color: '#686660', fontSize: 9, letterSpacing: 1.5, marginTop: 38 },
  voltar: { marginBottom: 18 },
  voltarTexto: { color: '#E99555', fontSize: 13, fontWeight: '700' },
  imagemDetalhe: { width: '100%', height: 250, borderRadius: 14, marginBottom: 18 },
  tituloDetalhe: { color: '#F5F2ED', fontSize: 29, fontWeight: '900', marginBottom: 5 },
  genero: { color: '#99958F', fontSize: 13, marginBottom: 12 },
  linhaNota: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  notaDestaque: { color: '#E99555', fontSize: 19, fontWeight: '900', marginBottom: 12 },
  mediaComunidade: { color: '#C2BEB7', fontSize: 12, marginBottom: 12 },
  descricao: { color: '#C2BEB7', fontSize: 14, lineHeight: 22, marginBottom: 14 },
  plataformasLinha: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 },
  plataformaPill: { color: '#C2BEB7', backgroundColor: '#292925', borderColor: '#3A3A34', borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 10, fontSize: 10, overflow: 'hidden' },
  linhaBotoes: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  botaoFlex: { flex: 1 },
  estrelas: { flexDirection: 'row', gap: 8, marginBottom: 8, marginTop: 2 },
  estrelaBotao: { padding: 3 },
  estrela: { color: '#77736D', fontSize: 38 },
  estrelaAtiva: { color: '#E99555' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tag: { borderWidth: 1, borderColor: '#3A3A34', borderRadius: 20, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#22221F' },
  tagAtiva: { borderColor: '#D97732', backgroundColor: '#30271F' },
  tagTexto: { color: '#B9B4AC', fontSize: 12 },
  tagTextoAtiva: { color: '#E99555', fontWeight: '800' },
  contadorTexto: { color: '#77736D', fontSize: 11, textAlign: 'right', marginTop: 6, marginBottom: 4 },
  reviewCard: { backgroundColor: '#22221F', borderWidth: 1, borderColor: '#34342F', padding: 15, borderRadius: 12, marginBottom: 10 },
  reviewTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  reviewAutor: { color: '#F5F2ED', fontSize: 13, fontWeight: '800' },
  reviewData: { color: '#77736D', fontSize: 10 },
  reviewNota: { color: '#E99555', fontSize: 13, fontWeight: '800', marginTop: 8, marginBottom: 5 },
  reviewTags: { color: '#B9B4AC', fontSize: 11, marginBottom: 8 },
  reviewTexto: { color: '#F5F2ED', fontSize: 13, lineHeight: 20, marginTop: 5 },
  reviewRecomendacao: { color: '#A6A19A', fontSize: 11, marginTop: 12 },
  perfilCard: { backgroundColor: '#22221F', borderRadius: 16, borderWidth: 1, borderColor: '#34342F', padding: 22, alignItems: 'center', marginBottom: 18 },
  avatarGrande: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#D97732', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarGrandeTexto: { color: '#171715', fontSize: 30, fontWeight: '900' },
  espaco: { height: 8 },
  navegacao: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 6 : 10, backgroundColor: '#20201D', borderTopWidth: 1, borderTopColor: '#34342F' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 7, minHeight: 48 },
  navIcone: { color: '#858078', fontSize: 24 },
  navTexto: { color: '#858078', fontSize: 10, fontWeight: '700' },
  navAtivo: { color: '#E99555' },
  overlayAbaFavoritos: { position: 'absolute', top: 66, left: 0, right: 0, bottom: 54, backgroundColor: '#171715', paddingHorizontal: 20, paddingTop: 20 },
  fecharAba: { marginBottom: 20 },
});

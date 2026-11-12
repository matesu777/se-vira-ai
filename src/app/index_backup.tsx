import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image, Linking, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

/**
 * DUCKLIST — protótipo funcional em React Native / Expo.
 * Instale: npx expo install @react-native-async-storage/async-storage
 * As avaliações editoriais são referências aproximadas, não notas oficiais.
 * Comentários e favoritos ficam salvos apenas neste aparelho. Para uma comunidade
 * online real, conecte um backend/autenticação (ex.: Supabase ou Firebase).
 */

type Game = {
  id: string; title: string; genre: string; year: number; developer: string;
  publisher: string; age: string; score: number; platforms: string[];
  steamId?: string; description: string; modes: string;
};
type Review = {
  id: string; gameId: string; username: string; rating: number;
  text: string; date: string;
};

const rawGames: Array<[string,string,string,number,string,string,string,number,string,string,string?]> = [
['elden-ring','Elden Ring','RPG • Mundo aberto',2022,'FromSoftware','Bandai Namco','16+',9.5,'Explore as Terras Intermédias, enfrente chefes desafiadores e descubra uma história de fantasia sombria.','Solo • Online','1245620'],
['cyberpunk-2077','Cyberpunk 2077','RPG • Ficção científica',2020,'CD Projekt Red','CD Projekt','18+',8.7,'Viva como V em Night City, uma metrópole futurista de escolhas, implantes e conflitos.','Solo','1091500'],
['hollow-knight','Hollow Knight','Metroidvania • Aventura',2017,'Team Cherry','Team Cherry','Livre',9.2,'Explore um reino subterrâneo desenhado à mão, repleto de segredos, criaturas e combates precisos.','Solo','367520'],
['stardew-valley','Stardew Valley','Simulação • Fazenda',2016,'ConcernedApe','ConcernedApe','Livre',9.3,'Construa uma fazenda, faça amizades, pesque, explore minas e crie sua própria rotina no campo.','Solo • Cooperativo','413150'],
['baldurs-gate-3',"Baldur's Gate 3",'RPG • Fantasia',2023,'Larian Studios','Larian Studios','18+',9.7,'Um RPG de escolhas profundas, combate tático e aventuras inspiradas em Dungeons & Dragons.','Solo • Cooperativo','1086940'],
['minecraft','Minecraft','Sandbox • Sobrevivência',2011,'Mojang Studios','Mojang Studios','Livre',9.3,'Construa qualquer coisa, explore mundos gerados e sobreviva sozinho ou com amigos.','Solo • Multiplayer',''],
['the-witcher-3','The Witcher 3: Wild Hunt','RPG • Mundo aberto',2015,'CD Projekt Red','CD Projekt','18+',9.5,'Assuma o papel de Geralt de Rívia em uma aventura narrativa num vasto mundo de fantasia.','Solo','292030'],
['red-dead-redemption-2','Red Dead Redemption 2','Ação • Mundo aberto',2018,'Rockstar Studios','Rockstar Games','18+',9.7,'Viva o fim da era do Velho Oeste como Arthur Morgan, em um mundo rico em detalhes.','Solo • Online','1174180'],
['grand-theft-auto-v','Grand Theft Auto V','Ação • Mundo aberto',2013,'Rockstar North','Rockstar Games','18+',9.2,'Explore Los Santos em uma história de crime, assaltos e três protagonistas.','Solo • Online','271590'],
['the-last-of-us-part-i','The Last of Us Part I','Ação • Sobrevivência',2022,'Naughty Dog','PlayStation Publishing','18+',9.0,'Joel e Ellie atravessam um mundo devastado em uma jornada intensa de sobrevivência.','Solo','1888930'],
['god-of-war','God of War','Ação • Aventura',2018,'Santa Monica Studio','PlayStation Publishing','18+',9.4,'Kratos e Atreus viajam pelos reinos da mitologia nórdica em uma história emocionante.','Solo','1593500'],
['god-of-war-ragnarok','God of War Ragnarök','Ação • Aventura',2022,'Santa Monica Studio','PlayStation Publishing','18+',9.3,'Enfrente deuses e monstros enquanto Kratos e Atreus encaram o destino dos Nove Reinos.','Solo','2322010'],
['ghost-of-tsushima','Ghost of Tsushima','Ação • Mundo aberto',2020,'Sucker Punch','PlayStation Publishing','18+',9.2,'Torne-se Jin Sakai e defenda Tsushima durante a invasão mongol.','Solo','2215430'],
['horizon-zero-dawn','Horizon Zero Dawn','Ação • RPG',2017,'Guerrilla Games','PlayStation Publishing','14+',8.9,'Aloy caça máquinas em um mundo pós-apocalíptico onde a natureza retomou a Terra.','Solo','1151640'],
['horizon-forbidden-west','Horizon Forbidden West','Ação • RPG',2022,'Guerrilla Games','PlayStation Publishing','14+',8.8,'Explore terras distantes e enfrente novas máquinas para salvar um mundo ameaçado.','Solo','2420110'],
['sekiro','Sekiro: Shadows Die Twice','Ação • Soulslike',2019,'FromSoftware','Activision','16+',9.1,'Domine a espada e a furtividade em uma aventura de ação ambientada no Japão Sengoku.','Solo','814380'],
['dark-souls-iii','Dark Souls III','RPG • Soulslike',2016,'FromSoftware','Bandai Namco','16+',9.0,'Enfrente inimigos implacáveis em um mundo sombrio que recompensa paciência e aprendizado.','Solo • Online','374320'],
['bloodborne','Bloodborne','Ação • RPG',2015,'FromSoftware','Sony Interactive','18+',9.3,'Investigue os horrores de Yharnam em um RPG de ação gótico e intenso.','Solo • Online',''],
['lies-of-p','Lies of P','Ação • Soulslike',2023,'Round8 Studio','NEOWIZ','16+',8.6,'Uma releitura sombria de Pinóquio, com combate exigente e escolhas morais.','Solo','1627720'],
['sekiro','Sekiro: Shadows Die Twice','Ação • Soulslike',2019,'FromSoftware','Activision','16+',9.1,'Domine a espada e a furtividade em uma aventura de ação ambientada no Japão Sengoku.','Solo','814380'],
['the-legend-of-zelda-botw','The Legend of Zelda: Breath of the Wild','Aventura • Mundo aberto',2017,'Nintendo EPD','Nintendo','10+',9.7,'Explore Hyrule livremente, resolva santuários e descubra como derrotar Calamity Ganon.','Solo','',''],
['tears-of-the-kingdom','The Legend of Zelda: Tears of the Kingdom','Aventura • Mundo aberto',2023,'Nintendo EPD','Nintendo','10+',9.6,'Crie soluções inventivas e explore Hyrule, os céus e as profundezas.','Solo','',''],
['super-mario-odyssey','Super Mario Odyssey','Plataforma • Aventura',2017,'Nintendo EPD','Nintendo','Livre',9.5,'Viaje por reinos variados com Mario e Cappy para resgatar a Princesa Peach.','Solo • Cooperativo','',''],
['super-mario-bros-wonder','Super Mario Bros. Wonder','Plataforma',2023,'Nintendo EPD','Nintendo','Livre',9.2,'Descubra efeitos surpreendentes das Flores Fenomenais em fases criativas de Mario.','Solo • Multiplayer','',''],
['animal-crossing-new-horizons','Animal Crossing: New Horizons','Simulação • Social',2020,'Nintendo EPD','Nintendo','Livre',9.0,'Transforme uma ilha deserta em um lar acolhedor, decorando e convivendo com vizinhos.','Solo • Online','',''],
['super-smash-bros-ultimate','Super Smash Bros. Ultimate','Luta • Party',2018,'Bandai Namco / Sora','Nintendo','10+',9.3,'Reúna personagens icônicos em batalhas frenéticas com muitas arenas e modos.','Multiplayer local • Online','',''],
['pokemon-scarlet-violet','Pokémon Scarlet / Violet','RPG • Aventura',2022,'Game Freak','Nintendo','Livre',8.0,'Capture Pokémon, explore uma região aberta e escolha seu próprio caminho de aventura.','Solo • Online','',''],
['final-fantasy-vii-remake','Final Fantasy VII Remake Intergrade','RPG • Ação',2021,'Square Enix','Square Enix','14+',8.8,'Revisite Midgar em uma reimaginação cinematográfica do clássico Final Fantasy VII.','Solo','1462040'],
['final-fantasy-xvi','Final Fantasy XVI','RPG • Ação',2023,'Creative Business Unit III','Square Enix','16+',8.5,'Clive Rosfield busca vingança em uma fantasia épica marcada por conflitos entre reinos.','Solo','2515020'],
['final-fantasy-xiv','Final Fantasy XIV Online','MMORPG • Fantasia',2013,'Square Enix','Square Enix','14+',9.0,'Aventure-se em Eorzea com milhares de jogadores em um MMORPG rico em histórias.','MMO','39210'],
['persona-5-royal','Persona 5 Royal','RPG • JRPG',2019,'P-Studio','SEGA','16+',9.5,'Leve uma vida dupla entre escola e incursões sobrenaturais para mudar corações corruptos.','Solo','1687950'],
['metaphor-refantazio','Metaphor: ReFantazio','RPG • Fantasia',2024,'Studio Zero','SEGA','14+',9.1,'Participe de uma disputa pelo trono em um RPG de fantasia dos criadores de Persona.','Solo','2679460'],
['resident-evil-4','Resident Evil 4','Terror • Ação',2023,'Capcom','Capcom','18+',9.2,'Leon Kennedy tenta resgatar a filha do presidente em uma vila cheia de perigos.','Solo','2050650'],
['resident-evil-village','Resident Evil Village','Terror • Sobrevivência',2021,'Capcom','Capcom','18+',8.7,'Investigue uma vila aterrorizante para encontrar sua filha desaparecida.','Solo','1196590'],
['resident-evil-2','Resident Evil 2','Terror • Ação',2019,'Capcom','Capcom','18+',9.2,'Sobreviva ao surto zumbi em Raccoon City com Leon e Claire.','Solo','883710'],
['silent-hill-2','Silent Hill 2','Terror psicológico',2024,'Bloober Team','KONAMI','18+',8.8,'James retorna a Silent Hill após receber uma carta misteriosa de sua esposa.','Solo','2124490'],
['alan-wake-2','Alan Wake 2','Terror • Narrativo',2023,'Remedy Entertainment','Epic Games','18+',9.0,'Dois protagonistas investigam uma trama sobrenatural que mistura realidade e ficção.','Solo',''],
['dead-space','Dead Space','Terror • Ficção científica',2023,'Motive Studio','Electronic Arts','18+',8.7,'Explore uma nave abandonada e enfrente horrores no espaço profundo.','Solo','1693980'],
['the-elder-scrolls-v-skyrim','The Elder Scrolls V: Skyrim','RPG • Mundo aberto',2011,'Bethesda Game Studios','Bethesda','16+',9.3,'Explore uma província fantástica, desenvolva seu personagem e enfrente dragões.','Solo','489830'],
['fallout-4','Fallout 4','RPG • Pós-apocalíptico',2015,'Bethesda Game Studios','Bethesda','18+',8.7,'Reconstrua sua vida em um deserto radioativo e tome decisões que moldam a região.','Solo','377160'],
['fallout-new-vegas','Fallout: New Vegas','RPG • Pós-apocalíptico',2010,'Obsidian Entertainment','Bethesda','18+',9.0,'Sobreviva no Mojave e decida o futuro de New Vegas em uma aventura de escolhas.','Solo','22380'],
['mass-effect-legendary','Mass Effect Legendary Edition','RPG • Ficção científica',2021,'BioWare','Electronic Arts','16+',9.1,'Comande a Normandy e reúna aliados para salvar a galáxia em uma trilogia remasterizada.','Solo','1328670'],
['dragon-age-inquisition','Dragon Age: Inquisition','RPG • Fantasia',2014,'BioWare','Electronic Arts','16+',8.8,'Lidere a Inquisição para fechar uma ruptura que ameaça o mundo de Thedas.','Solo','1222690'],
['dragon-age-the-veilguard','Dragon Age: The Veilguard','RPG • Fantasia',2024,'BioWare','Electronic Arts','16+',8.0,'Monte uma equipe de companheiros e enfrente uma ameaça antiga em Thedas.','Solo',''],
['the-outer-worlds','The Outer Worlds','RPG • Ficção científica',2019,'Obsidian Entertainment','Private Division','16+',8.2,'Explore colônias espaciais e tome decisões em uma sátira de corporações futuristas.','Solo','578650'],
['no-mans-sky','No Man’s Sky','Exploração • Sobrevivência',2016,'Hello Games','Hello Games','10+',8.7,'Viaje por um universo procedural de planetas, criaturas e descobertas.','Solo • Multiplayer','275850'],
['baldurs-gate-2','Baldur’s Gate II: Enhanced Edition','RPG • Fantasia',2000,'BioWare','Beamdog','14+',9.0,'Um RPG clássico de fantasia com narrativa extensa e combate estratégico.','Solo','257350'],
['diablo-iv','Diablo IV','ARPG • Fantasia sombria',2023,'Blizzard Entertainment','Blizzard','18+',8.5,'Lute contra forças demoníacas em Santuário com saques e builds variados.','Solo • Online','2344520'],
['path-of-exile','Path of Exile','ARPG • Fantasia sombria',2013,'Grinding Gear Games','Grinding Gear Games','16+',8.8,'Personalize sua build profundamente em um RPG de ação gratuito.','Online','238960'],
['world-of-warcraft','World of Warcraft','MMORPG • Fantasia',2004,'Blizzard Entertainment','Blizzard','12+',9.2,'Explore Azeroth, participe de masmorras e raids e evolua com uma comunidade global.','MMO','',''],
['runescape','RuneScape','MMORPG • Fantasia',2001,'Jagex','Jagex','12+',8.3,'Um MMORPG duradouro com habilidades, missões, comércio e exploração.','MMO','1343400'],
['league-of-legends','League of Legends','MOBA • Competitivo',2009,'Riot Games','Riot Games','12+',8.6,'Dispute partidas estratégicas em equipes de cinco campeões com funções distintas.','Online competitivo','',''],
['dota-2','Dota 2','MOBA • Estratégia',2013,'Valve','Valve','12+',8.8,'Um MOBA competitivo de alta profundidade, com heróis e estratégias variadas.','Online competitivo','570'],
['valorant','VALORANT','FPS • Tático',2020,'Riot Games','Riot Games','12+',8.5,'Combine precisão de tiro e habilidades de agentes em partidas táticas 5 contra 5.','Online competitivo','',''],
['counter-strike-2','Counter-Strike 2','FPS • Tático',2023,'Valve','Valve','16+',8.8,'Confrontos táticos entre terroristas e contra-terroristas com foco em habilidade.','Online competitivo','730'],
['overwatch-2','Overwatch 2','FPS • Heróis',2022,'Blizzard Entertainment','Blizzard','12+',7.8,'Escolha heróis com habilidades únicas e trabalhe em equipe em objetivos dinâmicos.','Online competitivo','2357570'],
['apex-legends','Apex Legends','Battle royale • FPS',2019,'Respawn Entertainment','Electronic Arts','16+',8.4,'Entre em um battle royale de esquadrões com personagens e habilidades distintas.','Online','1172470'],
['fortnite','Fortnite','Battle royale • Construção',2017,'Epic Games','Epic Games','12+',8.5,'Sobreviva, construa e participe de eventos e modos criados por uma comunidade enorme.','Online','',''],
['pubg-battlegrounds','PUBG: Battlegrounds','Battle royale • FPS',2017,'KRAFTON','KRAFTON','16+',8.0,'Pouse em um mapa, procure equipamentos e seja o último sobrevivente.','Online','578080'],
['call-of-duty-warzone','Call of Duty: Warzone','Battle royale • FPS',2020,'Raven Software','Activision','18+',7.9,'Combates em grande escala com armas, veículos e modos de battle royale.','Online','1962660'],
['call-of-duty-modern-warfare','Call of Duty: Modern Warfare','FPS • Ação',2019,'Infinity Ward','Activision','18+',8.2,'Campanha cinematográfica e modos competitivos de tiro militar.','Solo • Online','2000950'],
['doom-eternal','DOOM Eternal','FPS • Ação',2020,'id Software','Bethesda','18+',8.9,'Enfrente hordas demoníacas com combate veloz, arsenal brutal e trilha intensa.','Solo • Online','782330'],
['halo-infinite','Halo Infinite','FPS • Ficção científica',2021,'343 Industries','Xbox Game Studios','16+',8.0,'Master Chief encara uma nova ameaça em uma campanha de ficção científica.','Solo • Online','1240440'],
['destiny-2','Destiny 2','FPS • MMO',2017,'Bungie','Bungie','14+',8.3,'Explore o sistema solar, obtenha equipamentos e participe de atividades cooperativas.','Online','1085660'],
['rainbow-six-siege','Rainbow Six Siege','FPS • Tático',2015,'Ubisoft Montreal','Ubisoft','16+',8.4,'Ataque e defenda ambientes destrutíveis em combates táticos por equipes.','Online competitivo','359550'],
['battlefield-1','Battlefield 1','FPS • Guerra',2016,'DICE','Electronic Arts','18+',8.8,'Vivencie histórias da Primeira Guerra Mundial e batalhas multiplayer em larga escala.','Solo • Online','1238840'],
['titanfall-2','Titanfall 2','FPS • Ficção científica',2016,'Respawn Entertainment','Electronic Arts','16+',9.0,'Uma campanha inventiva une piloto e titã em combates ágeis e cinematográficos.','Solo • Online','1237970'],
['minecraft-dungeons','Minecraft Dungeons','Ação • Dungeon crawler',2020,'Mojang Studios','Xbox Game Studios','10+',7.8,'Enfrente masmorras e reúna equipamentos em uma aventura acessível no universo Minecraft.','Solo • Cooperativo','1672970'],
['terraria','Terraria','Sandbox • Aventura',2011,'Re-Logic','Re-Logic','10+',9.1,'Cave, construa, crie equipamentos e enfrente chefes em um mundo 2D expansivo.','Solo • Multiplayer','105600'],
['dont-starve-together','Don’t Starve Together','Sobrevivência • Cooperativo',2016,'Klei Entertainment','Klei Entertainment','10+',8.8,'Sobreviva a um mundo estranho coletando recursos, criando itens e cooperando.','Cooperativo','322330'],
['valheim','Valheim','Sobrevivência • Viking',2021,'Iron Gate Studio','Coffee Stain','16+',8.7,'Construa, navegue e enfrente criaturas mitológicas em um purgatório viking.','Solo • Cooperativo','892970'],
['rust','Rust','Sobrevivência • Multiplayer',2018,'Facepunch Studios','Facepunch Studios','16+',8.0,'Colete recursos, construa abrigos e negocie ou lute para sobreviver online.','Online','252490'],
['ark-survival-evolved','ARK: Survival Evolved','Sobrevivência • Dinossauros',2017,'Studio Wildcard','Studio Wildcard','16+',7.7,'Domestique dinossauros, construa bases e sobreviva em uma ilha misteriosa.','Solo • Online','346110'],
['subnautica','Subnautica','Sobrevivência • Exploração',2018,'Unknown Worlds','Unknown Worlds','10+',9.1,'Explore um oceano alienígena, construa equipamentos e descubra o que aconteceu.','Solo','264710'],
['the-forest','The Forest','Terror • Sobrevivência',2018,'Endnight Games','Endnight Games','18+',8.5,'Sobreviva em uma floresta perigosa enquanto procura seu filho desaparecido.','Solo • Cooperativo','242760'],
['sons-of-the-forest','Sons of the Forest','Terror • Sobrevivência',2024,'Endnight Games','Newnight','18+',8.0,'Explore uma ilha remota, construa abrigos e enfrente ameaças mutantes.','Solo • Cooperativo','1326470'],
['among-us','Among Us','Social • Dedução',2018,'Innersloth','Innersloth','10+',8.1,'Descubra os impostores entre seus companheiros em partidas sociais de dedução.','Online • Local','945360'],
['fall-guys','Fall Guys','Party • Plataforma',2020,'Mediatonic','Epic Games','Livre',7.8,'Dispute circuitos caóticos e minijogos coloridos até restar um vencedor.','Online','1097150'],
['rocket-league','Rocket League','Esporte • Veículos',2015,'Psyonix','Psyonix','Livre',8.7,'Jogue futebol com carros movidos a foguete em partidas rápidas e competitivas.','Online • Local','252950'],
['ea-sports-fc-25','EA SPORTS FC 25','Esporte • Futebol',2024,'EA Canada','Electronic Arts','Livre',7.8,'Monte seu time e dispute partidas de futebol com clubes e atletas licenciados.','Solo • Online',''],
['nba-2k25','NBA 2K25','Esporte • Basquete',2024,'Visual Concepts','2K','Livre',7.5,'Crie seu atleta, gerencie uma equipe e jogue basquete em vários modos.','Solo • Online',''],
['forza-horizon-5','Forza Horizon 5','Corrida • Mundo aberto',2021,'Playground Games','Xbox Game Studios','Livre',9.0,'Corra por paisagens mexicanas em um festival automobilístico repleto de eventos.','Solo • Online','1551360'],
['gran-turismo-7','Gran Turismo 7','Corrida • Simulação',2022,'Polyphony Digital','Sony Interactive','Livre',8.8,'Colecione carros e refine sua pilotagem em circuitos e desafios automobilísticos.','Solo • Online','',''],
['need-for-speed-heat','Need for Speed Heat','Corrida • Arcade',2019,'Ghost Games','Electronic Arts','12+',7.9,'Corra de dia e arrisque tudo à noite fugindo da polícia em Palm City.','Solo • Online','1222680'],
['trackmania','Trackmania','Corrida • Competitivo',2020,'Ubisoft Nadeo','Ubisoft','Livre',8.2,'Domine pistas curtas e técnicas e compare seus tempos com outros jogadores.','Online','2225070'],
['the-sims-4','The Sims 4','Simulação • Vida',2014,'Maxis','Electronic Arts','12+',8.1,'Crie Sims, construa casas e acompanhe histórias de vida em uma simulação aberta.','Solo','1222670'],
['cities-skylines','Cities: Skylines','Simulação • Construção',2015,'Colossal Order','Paradox Interactive','Livre',8.8,'Planeje bairros, transportes e serviços para transformar uma cidade em metrópole.','Solo','255710'],
['planet-zoo','Planet Zoo','Simulação • Gestão',2019,'Frontier Developments','Frontier Developments','Livre',8.7,'Construa zoológicos detalhados e cuide do bem-estar de animais e visitantes.','Solo','703080'],
['rimworld','RimWorld','Simulação • Estratégia',2018,'Ludeon Studios','Ludeon Studios','16+',9.1,'Gerencie uma colônia de sobreviventes em histórias emergentes geradas pelo jogo.','Solo','294100'],
['factorio','Factorio','Estratégia • Automação',2020,'Wube Software','Wube Software','Livre',9.4,'Projete fábricas automatizadas, otimize linhas de produção e defenda sua base.','Solo • Cooperativo','427520'],
['satisfactory','Satisfactory','Construção • Automação',2024,'Coffee Stain Studios','Coffee Stain','Livre',9.0,'Construa fábricas em um planeta alienígena e conecte sistemas de produção.','Solo • Cooperativo','526870'],
['civilization-vi','Sid Meier’s Civilization VI','Estratégia • Turnos',2016,'Firaxis Games','2K','Livre',8.8,'Conduza uma civilização desde a Antiguidade até a era moderna.','Solo • Multiplayer','289070'],
['age-of-empires-iv','Age of Empires IV','Estratégia • RTS',2021,'Relic Entertainment','Xbox Game Studios','12+',8.5,'Construa impérios históricos, reúna recursos e comande exércitos em tempo real.','Solo • Online','1466860'],
['starcraft-ii','StarCraft II','Estratégia • RTS',2010,'Blizzard Entertainment','Blizzard','12+',9.3,'Comande Terranos, Zergs ou Protoss em uma das séries RTS mais conhecidas.','Solo • Online','',''],
['xcom-2','XCOM 2','Estratégia • Tática',2016,'Firaxis Games','2K','14+',8.8,'Lidere a resistência humana em combates táticos contra uma ocupação alienígena.','Solo','268500'],
['total-war-warhammer-iii','Total War: Warhammer III','Estratégia • Fantasia',2022,'Creative Assembly','SEGA','14+',8.5,'Comande facções fantásticas em campanhas estratégicas e batalhas em larga escala.','Solo • Multiplayer','1142710'],
['helldivers-2','Helldivers 2','Ação • Cooperativo',2024,'Arrowhead Game Studios','PlayStation Publishing','18+',8.6,'Trabalhe em esquadrão para defender a Super Terra em missões caóticas.','Cooperativo online','553850'],
['it-takes-two','It Takes Two','Aventura • Cooperativo',2021,'Hazelight Studios','Electronic Arts','10+',9.0,'Uma aventura cooperativa criativa em que duas pessoas precisam trabalhar juntas.','Cooperativo obrigatório','1426210'],
['portal-2','Portal 2','Puzzle • Aventura',2011,'Valve','Valve','Livre',9.5,'Resolva quebra-cabeças com portais em uma aventura de humor e ficção científica.','Solo • Cooperativo','620'],
['the-witness','The Witness','Puzzle • Exploração',2016,'Thekla, Inc.','Thekla, Inc.','Livre',8.7,'Resolva enigmas em uma ilha misteriosa sem tutoriais tradicionais.','Solo','210970'],
['celeste','Celeste','Plataforma • Precisão',2018,'Maddy Makes Games','Maddy Makes Games','Livre',9.3,'Ajude Madeline a escalar uma montanha em um desafio de plataforma sensível e preciso.','Solo','504230'],
['cuphead','Cuphead','Plataforma • Run and gun',2017,'Studio MDHR','Studio MDHR','10+',8.8,'Enfrente chefes com animação inspirada em desenhos clássicos dos anos 1930.','Solo • Cooperativo','268910'],
['undertale','Undertale','RPG • Indie',2015,'Toby Fox','Toby Fox','10+',9.2,'Explore o subterrâneo e decida como lidar com monstros em um RPG singular.','Solo','391540'],
['omori','OMORI','RPG • Terror psicológico',2020,'OMOCAT','OMOCAT','16+',8.9,'Explore mundos oníricos e enfrente temas emocionais em um RPG independente.','Solo','1150690'],
['disco-elysium','Disco Elysium - The Final Cut','RPG • Investigação',2019,'ZA/UM','ZA/UM','18+',9.1,'Investigue um assassinato como detetive em um RPG focado em diálogos e escolhas.','Solo','632360'],
['outer-wilds','Outer Wilds','Exploração • Mistério',2019,'Mobius Digital','Annapurna Interactive','Livre',9.3,'Investigue um sistema solar preso em um ciclo temporal cheio de mistérios.','Solo','753640'],
['hades','Hades','Roguelike • Ação',2020,'Supergiant Games','Supergiant Games','12+',9.3,'Escape do submundo grego em combates rápidos com armas e bênçãos divinas.','Solo','1145360'],
['hades-ii','Hades II','Roguelike • Ação',2024,'Supergiant Games','Supergiant Games','12+',9.0,'Lute contra o Titã do Tempo como Melinoë em uma nova aventura mitológica.','Solo','1145350'],
['vampire-survivors','Vampire Survivors','Roguelike • Casual',2022,'poncle','poncle','10+',8.9,'Sobreviva a ondas de inimigos e combine melhorias em partidas rápidas.','Solo • Cooperativo','1794680'],
['balatro','Balatro','Cartas • Roguelike',2024,'LocalThunk','Playstack','Livre',9.0,'Combine pôquer e poderes especiais para criar pontuações absurdas em runs estratégicas.','Solo','2379780'],
['slay-the-spire','Slay the Spire','Cartas • Roguelike',2019,'Mega Crit','Mega Crit','Livre',9.0,'Monte um baralho poderoso e suba uma torre cheia de encontros imprevisíveis.','Solo','646570'],
['dead-cells','Dead Cells','Roguelike • Metroidvania',2018,'Motion Twin','Motion Twin','12+',8.9,'Explore níveis interconectados e lute com armas variadas em runs desafiadoras.','Solo','588650'],
['binding-of-isaac-rebirth','The Binding of Isaac: Rebirth','Roguelike • Ação',2014,'Nicalis','Nicalis','16+',9.0,'Explore masmorras geradas e combine centenas de itens em uma aventura sombria.','Solo','250900'],
['league-of-legends-wild-rift','Teamfight Tactics','Estratégia • Auto battler',2019,'Riot Games','Riot Games','12+',8.1,'Monte uma equipe de campeões e enfrente outros jogadores em batalhas automáticas.','Online','',''],
['the-finals','THE FINALS','FPS • Equipes',2023,'Embark Studios','Nexon','16+',8.0,'Participe de um game show competitivo com arenas destrutíveis e objetivos rápidos.','Online','2073850'],
['palworld','Palworld','Sobrevivência • Criaturas',2024,'Pocketpair','Pocketpair','12+',8.2,'Capture criaturas, construa bases e explore um mundo aberto com amigos.','Solo • Cooperativo','1623730'],
['black-myth-wukong','Black Myth: Wukong','Ação • RPG',2024,'Game Science','Game Science','16+',8.8,'Enfrente criaturas mitológicas inspiradas na Jornada ao Oeste em combates exigentes.','Solo','2358720'],
['assassins-creed-odyssey',"Assassin’s Creed Odyssey",'Ação • RPG',2018,'Ubisoft Quebec','Ubisoft','18+',8.6,'Explore a Grécia antiga como mercenário em uma aventura de escolhas e descobertas.','Solo','812140'],
['assassins-creed-valhalla',"Assassin’s Creed Valhalla",'Ação • RPG',2020,'Ubisoft Montreal','Ubisoft','18+',8.2,'Lidere um clã viking e estabeleça um assentamento na Inglaterra medieval.','Solo','2208920'],
['far-cry-5','Far Cry 5','FPS • Mundo aberto',2018,'Ubisoft Montreal','Ubisoft','18+',8.0,'Enfrente um culto extremista em uma região rural de Montana.','Solo • Cooperativo','552520'],
['watch-dogs-2','Watch Dogs 2','Ação • Mundo aberto',2016,'Ubisoft Montreal','Ubisoft','18+',8.2,'Use hacking, drones e criatividade para expor uma rede de vigilância em San Francisco.','Solo • Online','447040'],
['persona-4-golden','Persona 4 Golden','RPG • JRPG',2012,'Atlus','SEGA','14+',9.2,'Investigue assassinatos misteriosos e fortaleça laços em uma cidade japonesa.','Solo','1113000'],
['the-binding-of-isaac','The Binding of Isaac','Roguelike • Ação',2011,'Edmund McMillen','Headup','16+',8.5,'Enfrente criaturas e descubra itens em masmorras geradas aleatoriamente.','Solo','113200'],
['left-4-dead-2','Left 4 Dead 2','FPS • Cooperativo',2009,'Valve','Valve','18+',9.0,'Sobreviva a hordas de infectados em campanhas cooperativas para quatro jogadores.','Cooperativo','550'],
['team-fortress-2','Team Fortress 2','FPS • Equipes',2007,'Valve','Valve','16+',8.8,'Escolha entre nove classes em um shooter de equipes com humor e estratégia.','Online','440'],
['garrys-mod',"Garry’s Mod",'Sandbox • Física',2006,'Facepunch Studios','Valve','12+',8.8,'Crie cenários e modos de jogo usando ferramentas de física e conteúdo da comunidade.','Solo • Multiplayer','4000'],
['the-long-dark','The Long Dark','Sobrevivência • Exploração',2017,'Hinterland Studio','Hinterland Studio','12+',8.5,'Sobreviva ao frio e à escassez após um desastre geomagnético em regiões selvagens.','Solo','305620'],
['firewatch','Firewatch','Aventura • Narrativa',2016,'Campo Santo','Panic','12+',8.5,'Trabalhe como vigia florestal e desvende acontecimentos estranhos em Wyoming.','Solo','383870'],
['life-is-strange','Life is Strange','Aventura • Narrativa',2015,'Dontnod Entertainment','Square Enix','14+',8.8,'Max descobre a capacidade de voltar no tempo e enfrenta consequências pessoais.','Solo','319630'],
['detroit-become-human','Detroit: Become Human','Aventura • Narrativa',2018,'Quantic Dream','Quantic Dream','16+',8.7,'Acompanhe androides em uma história ramificada sobre escolhas e humanidade.','Solo','1222140'],
['nier-automata','NieR:Automata','Ação • RPG',2017,'PlatinumGames','Square Enix','16+',9.0,'Androides lutam por um planeta devastado em uma história filosófica e cheia de ação.','Solo','524220'],
['metal-gear-solid-v','Metal Gear Solid V: The Phantom Pain','Ação • Furtividade',2015,'Kojima Productions','Konami','18+',9.0,'Planeje infiltrações em ambientes abertos com liberdade tática e equipamentos variados.','Solo','287700'],
['street-fighter-6','Street Fighter 6','Luta • Competitivo',2023,'Capcom','Capcom','12+',8.8,'Domine lutadores clássicos e novos em um jogo de luta com modos variados.','Solo • Online','1364780'],
['mortal-kombat-1','Mortal Kombat 1','Luta • Ação',2023,'NetherRealm Studios','Warner Bros.','18+',8.0,'Lute em uma nova era de Mortal Kombat com fatalities e personagens icônicos.','Solo • Online','1971870'],
['tekken-8','TEKKEN 8','Luta • Competitivo',2024,'Bandai Namco Studios','Bandai Namco','12+',8.4,'Combates 3D intensos com um elenco amplo e sistema de luta agressivo.','Solo • Online','1778820'],
['euro-truck-simulator-2','Euro Truck Simulator 2','Simulação • Direção',2012,'SCS Software','SCS Software','Livre',8.9,'Dirija caminhões pela Europa, entregue cargas e expanda sua empresa de transporte.','Solo • Online','227300'],
['american-truck-simulator','American Truck Simulator','Simulação • Direção',2016,'SCS Software','SCS Software','Livre',8.7,'Transporte cargas por estradas e cidades dos Estados Unidos.','Solo • Online','270880'],
['powerwash-simulator','PowerWash Simulator','Simulação • Casual',2022,'FuturLab','Square Enix','Livre',8.5,'Limpe ambientes com jatos de água em uma experiência relaxante e satisfatória.','Solo • Cooperativo','1290000'],
['dave-the-diver','DAVE THE DIVER','Aventura • Gestão',2023,'MINTROCKET','MINTROCKET','Livre',8.9,'Explore o mar durante o dia e administre um restaurante de sushi à noite.','Solo','1868140'],
['sea-of-thieves','Sea of Thieves','Aventura • Piratas',2018,'Rare','Xbox Game Studios','12+',8.5,'Navegue com sua tripulação, procure tesouros e enfrente outros piratas.','Online cooperativo','1172620'],
['it-takes-two','It Takes Two','Aventura • Cooperativo',2021,'Hazelight Studios','Electronic Arts','10+',9.0,'Uma aventura cooperativa criativa em que duas pessoas precisam trabalhar juntas.','Cooperativo obrigatório','1426210'],
['the-legend-of-zelda-totk','The Legend of Zelda: Tears of the Kingdom','Aventura • Mundo aberto',2023,'Nintendo EPD','Nintendo','10+',9.6,'Crie soluções inventivas e explore Hyrule, os céus e as profundezas.','Solo','','']
];

const games: Game[] = rawGames
  .filter((g, i, all) => all.findIndex(x => x[0] === g[0]) === i)
  .slice(0, 100)
  .map(g => ({
    id: g[0], title: g[1], genre: g[2], year: g[3], developer: g[4],
    publisher: g[5], age: g[6], score: g[7], description: g[8],
    modes: g[9], steamId: g[10],
    platforms: inferPlatforms(g[1], g[10])
  }));

function inferPlatforms(title: string, steamId?: string): string[] {
  const nintendo = /Zelda|Mario|Animal Crossing|Smash Bros|Pokémon/i.test(title);
  const xbox = /Forza|Halo|Gears|Sea of Thieves|Age of Empires/i.test(title);
  const playstation = /Bloodborne|Gran Turismo/i.test(title);
  if (nintendo) return ['Nintendo Switch'];
  if (playstation) return ['PlayStation'];
  if (xbox) return ['PC', 'Xbox'];
  return steamId ? ['PC', 'PlayStation', 'Xbox'] : ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'];
}
const imageFor = (g: Game) => g.steamId
  ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.steamId}/library_600x900.jpg`
  : `https://placehold.co/600x900/24231f/f5f2ed?text=${encodeURIComponent(g.title)}`;

export default function Index() {
  const [tab, setTab] = useState<'catalogo'|'favoritos'|'comunidade'>('catalogo');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('Todos');
  const [sort, setSort] = useState<'popular'|'az'|'year'>('popular');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [username, setUsername] = useState('Gamer');
  const [rating, setRating] = useState('10');
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [f, r, u] = await Promise.all([
          AsyncStorage.getItem('@ducklist/favorites'),
          AsyncStorage.getItem('@ducklist/reviews'),
          AsyncStorage.getItem('@ducklist/username'),
        ]);
        if (f) setFavorites(JSON.parse(f));
        if (r) setReviews(JSON.parse(r));
        if (u) setUsername(u);
      } catch {
        Alert.alert('Aviso', 'Não foi possível carregar os dados locais.');
      } finally { setLoading(false); }
    })();
  }, []);

  async function persistFavorites(next: string[]) {
    setFavorites(next);
    try { await AsyncStorage.setItem('@ducklist/favorites', JSON.stringify(next)); } catch {}
  }
  async function persistReviews(next: Review[]) {
    setReviews(next);
    try { await AsyncStorage.setItem('@ducklist/reviews', JSON.stringify(next)); } catch {}
  }
  function toggleFavorite(id: string) {
    void persistFavorites(favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id]);
  }
  function publishReview() {
    if (!selected) return;
    const n = Number(rating.replace(',', '.'));
    if (!reviewText.trim()) return Alert.alert('Falta seu comentário', 'Escreva sua opinião antes de publicar.');
    if (!Number.isFinite(n) || n < 0 || n > 10) return Alert.alert('Nota inválida', 'Informe uma nota entre 0 e 10.');
    const next: Review[] = [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gameId: selected.id, username: username.trim() || 'Gamer',
      rating: Math.round(n * 10) / 10, text: reviewText.trim(),
      date: new Date().toLocaleDateString('pt-BR')
    }, ...reviews];
    void persistReviews(next);
    setReviewText(''); setRating('10');
    Alert.alert('Avaliação publicada', 'Sua avaliação foi salva neste aparelho.');
  }
  const genres = useMemo(() => ['Todos', ...Array.from(new Set(games.map(g => g.genre.split(' • ')[0]))).sort()], []);
  const filtered = useMemo(() => {
    let list = games.filter(g =>
      g.title.toLowerCase().includes(query.toLowerCase()) &&
      (genre === 'Todos' || g.genre.startsWith(genre))
    );
    if (tab === 'favoritos') list = list.filter(g => favorites.includes(g.id));
    if (sort === 'az') list = [...list].sort((a,b) => a.title.localeCompare(b.title));
    if (sort === 'year') list = [...list].sort((a,b) => b.year-a.year);
    if (sort === 'popular') list = [...list].sort((a,b) => b.score-a.score);
    return list;
  }, [query, genre, tab, favorites, sort]);
  const gameReviews = selected ? reviews.filter(r => r.gameId === selected.id) : [];
  const communityReviews = reviews.filter(r => r.text.trim());

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => { setSelected(null); setTab('catalogo'); }}><Text style={styles.logo}>duck<Text style={styles.orange}>list</Text><Text style={styles.orange}>.</Text></Text></TouchableOpacity>
      <Text style={styles.headerTag}>SUA COMUNIDADE GAMER</Text>
    </View>
  );
  const Tabs = () => (
    <View style={styles.tabs}>
      {([['catalogo','Catálogo'],['favoritos','♡ Favoritos'],['comunidade','Comentários']] as const).map(([key,label]) =>
        <TouchableOpacity key={key} onPress={() => { setSelected(null); setTab(key); }} style={[styles.tab, tab===key && styles.tabActive]}>
          <Text style={[styles.tabText, tab===key && styles.tabTextActive]}>{label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) return <SafeAreaView style={styles.loading}><ActivityIndicator size="large" color="#D97732"/><Text style={styles.muted}>Carregando Ducklist...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#171715"/>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Header />
        {selected ? (
          <View>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.back}><Text style={styles.orange}>← Voltar ao catálogo</Text></TouchableOpacity>
            <View style={styles.detailTop}>
              <Image source={{uri:imageFor(selected)}} style={styles.detailImage} resizeMode="cover" onError={() => {}}/>
              <View style={styles.detailInfo}>
                <Text style={styles.detailTitle}>{selected.title}</Text>
                <Text style={styles.muted}>{selected.genre} · {selected.year}</Text>
                <Text style={styles.score}>★ {selected.score.toFixed(1)} <Text style={styles.muted}>/ 10 · nota editorial</Text></Text>
                <Text style={styles.description}>{selected.description}</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => toggleFavorite(selected.id)}>
                  <Text style={styles.primaryText}>{favorites.includes(selected.id) ? '♥ Remover dos favoritos' : '♡ Adicionar aos favoritos'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.infoGrid}>
              <Info label="CLASSIFICAÇÃO INDICATIVA" value={selected.age}/>
              <Info label="LANÇAMENTO" value={String(selected.year)}/>
              <Info label="DESENVOLVEDORA" value={selected.developer}/>
              <Info label="PUBLICADORA" value={selected.publisher}/>
              <Info label="PLATAFORMAS" value={selected.platforms.join(', ')}/>
              <Info label="MODOS" value={selected.modes}/>
            </View>
            {selected.steamId ? <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(`https://store.steampowered.com/app/${selected.steamId}/`)}>
              <Text style={styles.orange}>Ver página do jogo na Steam ↗</Text>
            </TouchableOpacity> : null}
            <View style={styles.divider}/>
            <Text style={styles.sectionTitle}>Avalie este jogo</Text>
            <Text style={styles.label}>Seu nome ou apelido</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Como você quer aparecer?" placeholderTextColor="#777"/>
            <Text style={styles.label}>Sua nota (0 a 10)</Text>
            <TextInput style={styles.input} value={rating} onChangeText={setRating} keyboardType="decimal-pad" placeholder="Ex.: 9,5" placeholderTextColor="#777"/>
            <Text style={styles.label}>Comentário</Text>
            <TextInput style={[styles.input,styles.multiline]} value={reviewText} onChangeText={setReviewText} multiline textAlignVertical="top" placeholder="Conte o que achou do jogo..." placeholderTextColor="#777"/>
            <TouchableOpacity style={styles.primaryButton} onPress={publishReview}><Text style={styles.primaryText}>Publicar avaliação</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>Comentários da comunidade ({gameReviews.length})</Text>
            {gameReviews.length ? gameReviews.map(r => <ReviewCard key={r.id} review={r}/>) : <Text style={styles.empty}>Ainda não há comentários para este jogo. Seja o primeiro!</Text>}
          </View>
        ) : tab === 'comunidade' ? (
          <View>
            <Text style={styles.heroSmall}>CONVERSAS DA COMUNIDADE</Text>
            <Text style={styles.heroTitle}>Opiniões de quem joga.</Text>
            <Text style={styles.muted}>Avaliações publicadas neste aparelho.</Text>
            {communityReviews.length ? communityReviews.map(r => {
              const game = games.find(g => g.id === r.gameId);
              return <View key={r.id} style={styles.communityItem}>
                <TouchableOpacity onPress={() => game && setSelected(game)}><Text style={styles.orange}>{game?.title ?? 'Jogo'} · ★ {r.rating.toFixed(1)}/10</Text></TouchableOpacity>
                <ReviewCard review={r}/>
              </View>;
            }) : <Text style={styles.empty}>Ainda não há comentários. Abra um jogo no catálogo e publique a primeira avaliação.</Text>}
          </View>
        ) : (
          <View>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>SEU UNIVERSO GAMER</Text>
              <Text style={styles.heroTitle}>Jogue. Avalie.{'\n'}<Text style={styles.orange}>Descubra.</Text></Text>
              <Text style={styles.heroDesc}>Explore jogos, compare notas e encontre sua próxima aventura.</Text>
              <View style={styles.stats}><Text style={styles.stat}>{games.length} JOGOS</Text><Text style={styles.stat}>{reviews.length} AVALIAÇÕES</Text><Text style={styles.stat}>{favorites.length} FAVORITOS</Text></View>
            </View>
            <Tabs/>
            <TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="⌕  Buscar por nome..." placeholderTextColor="#858585"/>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
              {genres.map(g => <TouchableOpacity key={g} onPress={() => setGenre(g)} style={[styles.chip, genre===g && styles.chipActive]}><Text style={[styles.chipText,genre===g&&styles.chipTextActive]}>{g}</Text></TouchableOpacity>)}
            </ScrollView>
            <View style={styles.rowBetween}><Text style={styles.sectionTitle}>{tab==='favoritos'?'Seus favoritos':'Catálogo de jogos'}</Text><Text style={styles.muted}>{filtered.length} jogos</Text></View>
            <View style={styles.sortRow}>
              {([['popular','Maior nota'],['az','A–Z'],['year','Recentes']] as const).map(([key,label])=><TouchableOpacity key={key} onPress={()=>setSort(key)} style={[styles.sortChip,sort===key&&styles.sortActive]}><Text style={[styles.sortText,sort===key&&styles.sortTextActive]}>{label}</Text></TouchableOpacity>)}
            </View>
            {filtered.length ? <View style={styles.grid}>{filtered.map(g => <TouchableOpacity key={g.id} style={styles.gameCard} onPress={() => setSelected(g)} activeOpacity={0.85}>
              <View style={styles.posterWrap}><Image source={{uri:imageFor(g)}} style={styles.poster} resizeMode="cover"/><View style={styles.ratingBadge}><Text style={styles.ratingText}>★ {g.score.toFixed(1)}</Text></View>
                <TouchableOpacity style={styles.heart} onPress={() => toggleFavorite(g.id)}><Text style={styles.heartText}>{favorites.includes(g.id)?'♥':'♡'}</Text></TouchableOpacity>
              </View>
              <View style={styles.cardInfo}><Text style={styles.gameTitle} numberOfLines={2}>{g.title}</Text><Text style={styles.gameGenre} numberOfLines={1}>{g.genre}</Text><Text style={styles.gameYear}>{g.year} · {g.age}</Text><Text style={styles.cardLink}>Ver detalhes →</Text></View>
            </TouchableOpacity>)}</View> : <Text style={styles.empty}>Nenhum jogo encontrado. Tente outro nome ou gênero.</Text>}
          </View>
        )}
        <Text style={styles.footer}>DUCKLIST © 2026 · FEITO PARA QUEM JOGA</Text>
        <Text style={styles.disclaimer}>Notas e classificações são informativas e podem variar por edição/região. Confira a classificação oficial local antes de jogar.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({label,value}:{label:string;value:string}) {
  return <View style={styles.infoCell}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}
function ReviewCard({review}:{review:Review}) {
  return <View style={styles.reviewCard}><View style={styles.reviewHeader}><Text style={styles.reviewUser}>{review.username}</Text><Text style={styles.reviewRating}>★ {review.rating.toFixed(1)}/10</Text></View><Text style={styles.reviewDate}>{review.date}</Text><Text style={styles.reviewText}>{review.text}</Text></View>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#171715'}, loading:{flex:1,backgroundColor:'#171715',alignItems:'center',justifyContent:'center',gap:12},
  page:{paddingHorizontal:18,paddingTop:18,paddingBottom:44,width:'100%',maxWidth:1100,alignSelf:'center'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
  logo:{color:'#F5F2ED',fontSize:31,fontWeight:'900',letterSpacing:-1.5},orange:{color:'#E99555'},headerTag:{fontSize:9,color:'#99958F',letterSpacing:1.2},
  hero:{backgroundColor:'#24231F',borderColor:'#3A3026',borderWidth:1,borderRadius:18,padding:24,marginBottom:24},
  eyebrow:{color:'#D97732',fontSize:10,fontWeight:'900',letterSpacing:2,marginBottom:14},heroTitle:{fontSize:36,lineHeight:42,fontWeight:'900',color:'#F5F2ED',letterSpacing:-1.2},heroDesc:{fontSize:13,color:'#A6A19A',marginTop:12,lineHeight:20},
  stats:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:22},stat:{fontSize:9,fontWeight:'800',color:'#E99555',backgroundColor:'#30271F',paddingHorizontal:10,paddingVertical:8,borderRadius:6},
  tabs:{flexDirection:'row',gap:8,marginBottom:18},tab:{paddingVertical:10,paddingHorizontal:13,borderRadius:9,backgroundColor:'#22221F',borderWidth:1,borderColor:'#34342F'},tabActive:{backgroundColor:'#D97732',borderColor:'#D97732'},tabText:{fontSize:12,color:'#C2BEB7',fontWeight:'700'},tabTextActive:{color:'#171715'},
  search:{height:48,backgroundColor:'#232320',borderColor:'#353530',borderWidth:1,borderRadius:12,paddingHorizontal:15,color:'#F5F2ED',marginBottom:12},
  genreScroll:{marginBottom:18},chip:{paddingHorizontal:13,paddingVertical:8,borderRadius:20,backgroundColor:'#232320',borderWidth:1,borderColor:'#34342F',marginRight:8},chipActive:{backgroundColor:'#30271F',borderColor:'#D97732'},chipText:{fontSize:11,color:'#A6A19A'},chipTextActive:{color:'#E99555',fontWeight:'800'},
  rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{color:'#F5F2ED',fontSize:21,fontWeight:'800',marginTop:10,marginBottom:14},muted:{color:'#99958F',fontSize:12,lineHeight:18},
  sortRow:{flexDirection:'row',gap:8,marginBottom:16},sortChip:{paddingVertical:7,paddingHorizontal:10,borderRadius:7,backgroundColor:'#22221F'},sortActive:{backgroundColor:'#3B2B1F'},sortText:{color:'#99958F',fontSize:11},sortTextActive:{color:'#E99555',fontWeight:'800'},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:12,justifyContent:'flex-start'},gameCard:{width:'47.5%',flexGrow:1,maxWidth:260,overflow:'hidden',backgroundColor:'#22221F',borderRadius:13,borderWidth:1,borderColor:'#34342F',marginBottom:4},
  posterWrap:{height:205,position:'relative',backgroundColor:'#292925'},poster:{width:'100%',height:'100%'},ratingBadge:{position:'absolute',bottom:8,left:8,backgroundColor:'#171715E8',paddingHorizontal:8,paddingVertical:5,borderRadius:6},ratingText:{color:'#E99555',fontSize:11,fontWeight:'900'},heart:{position:'absolute',top:8,right:8,width:32,height:32,borderRadius:16,backgroundColor:'#171715DD',alignItems:'center',justifyContent:'center'},heartText:{color:'#E99555',fontSize:20},
  cardInfo:{padding:11},gameTitle:{color:'#F5F2ED',fontSize:13,fontWeight:'800',minHeight:34},gameGenre:{color:'#99958F',fontSize:10,marginTop:5},gameYear:{color:'#77736C',fontSize:10,marginTop:5},cardLink:{color:'#E99555',fontSize:11,fontWeight:'800',marginTop:12},
  detailTop:{flexDirection:'row',gap:18,marginTop:12,marginBottom:20,flexWrap:'wrap'},detailImage:{width:160,height:235,borderRadius:12,backgroundColor:'#292925'},detailInfo:{flex:1,minWidth:190},detailTitle:{color:'#F5F2ED',fontSize:28,fontWeight:'900',marginBottom:7},score:{color:'#E99555',fontSize:20,fontWeight:'900',marginTop:12,marginBottom:12},description:{color:'#C2BEB7',fontSize:13,lineHeight:21,marginBottom:16},back:{marginBottom:8,paddingVertical:8},primaryButton:{backgroundColor:'#D97732',padding:14,alignItems:'center',borderRadius:10,marginTop:6,marginBottom:20},primaryText:{color:'#171715',fontWeight:'900',fontSize:13},
  infoGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},infoCell:{width:'47%',flexGrow:1,backgroundColor:'#22221F',borderColor:'#34342F',borderWidth:1,borderRadius:10,padding:13},infoLabel:{fontSize:9,color:'#99958F',fontWeight:'800',letterSpacing:.5,marginBottom:7},infoValue:{fontSize:12,color:'#F5F2ED',lineHeight:18,fontWeight:'600'},linkButton:{paddingVertical:14},divider:{height:1,backgroundColor:'#34342F',marginVertical:22},
  label:{color:'#C2BEB7',fontSize:12,marginBottom:7,marginTop:8},input:{backgroundColor:'#232320',color:'#F5F2ED',borderColor:'#3A3A34',borderWidth:1,borderRadius:10,paddingHorizontal:13,paddingVertical:12,fontSize:14,marginBottom:12},multiline:{minHeight:110},
  reviewCard:{backgroundColor:'#22221F',borderWidth:1,borderColor:'#34342F',padding:14,borderRadius:10,marginBottom:10},reviewHeader:{flexDirection:'row',justifyContent:'space-between',gap:10},reviewUser:{color:'#F5F2ED',fontSize:13,fontWeight:'800'},reviewRating:{color:'#E99555',fontSize:12,fontWeight:'900'},reviewDate:{color:'#77736C',fontSize:10,marginTop:4,marginBottom:8},reviewText:{color:'#C2BEB7',fontSize:13,lineHeight:20},communityItem:{marginTop:10},empty:{color:'#99958F',fontSize:13,lineHeight:21,marginVertical:18},heroSmall:{color:'#D97732',fontSize:10,fontWeight:'900',letterSpacing:1.5,marginTop:10},footer:{textAlign:'center',color:'#686660',fontSize:9,letterSpacing:1.4,marginTop:36},disclaimer:{textAlign:'center',color:'#686660',fontSize:9,lineHeight:14,marginTop:8},
});

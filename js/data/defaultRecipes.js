const now = Date.now();

export const defaultRecipes = [
    {
        id: now.toString(),
        name: 'Паста с брокколи и горошком',
        time: '45',
        description: 'Вкусная паста с брокколи и зеленым горошком в сливочном соусе',
        image: 'images/recipe_1.png',
        category: 'lunch',
        timestamp: now - 86400000 * 7,
        comments: []
    },
    {
        id: (now + 1).toString(),
        name: 'Блинный торт «Пломбир»',
        time: '60',
        description: 'Нежный блинный торт со сливочным кремом и ванилью',
        image: 'images/recipe_2.png',
        category: 'dessert',
        timestamp: now - 86400000 * 6,
        comments: []
    },
    {
        id: (now + 2).toString(),
        name: 'Паста с морепродуктами',
        time: '45',
        description: 'Паста с морепродуктами в сливочном соусе с чесноком и зеленью',
        image: 'images/recipe_3.png',
        category: 'lunch',
        timestamp: now - 86400000 * 5,
        comments: []
    },
    {
        id: (now + 3).toString(),
        name: 'Салат из свеклы, моркови и горошка с пшеном',
        time: '45',
        description: 'Полезный салат из свеклы с морковью, горошком и пшеном',
        image: 'images/recipe_4.png',
        category: 'lunch',
        timestamp: now - 86400000 * 4,
        comments: []
    },
    {
        id: (now + 4).toString(),
        name: 'Капрезе',
        time: '45',
        description: 'Классический итальянский салат с моцареллой, томатами и базиликом',
        image: 'images/recipe_5.png',
        category: 'breakfast',
        timestamp: now - 86400000 * 3,
        comments: []
    },
    {
        id: (now + 5).toString(),
        name: 'Меренговый рулет',
        time: '45',
        description: 'Воздушный рулет из меренги с ягодами и сливочным кремом',
        image: 'images/recipe_6.png',
        category: 'dessert',
        timestamp: now - 86400000 * 2,
        comments: []
    },
    {
        id: (now + 6).toString(),
        name: 'Ролл «Филадельфия»',
        time: '45',
        description: 'Классические роллы с лососем, сливочным сыром и авокадо',
        image: 'images/recipe_7.png',
        category: 'lunch',
        timestamp: now - 86400000 * 1,
        comments: []
    },
    {
        id: (now + 7).toString(),
        name: 'Омлет с авокадо',
        time: '45',
        description: 'Пышный омлет с авокадо, зеленью и помидорами черри',
        image: 'images/recipe_8.png',
        category: 'breakfast',
        timestamp: now,
        comments: []
    }
];
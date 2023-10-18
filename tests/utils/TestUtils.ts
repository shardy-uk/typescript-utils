import {BusinessGroupDoc, LineItemDoc, PurchaseOrderDoc, RoleDoc, UserDoc} from '../../services/dao/TypedPouchDAO';

export default class TestUtils {
    // Yeah, that is a big list of names isn't it!
    static firstnames = [
        "Emma", "Liam", "Olivia", "Noah", "Ava", "Isabella", "Sophia", "Jackson",
        "Aiden", "Lucas", "Matthew", "Ella", "Amelia", "Logan", "Mia", "Oliver",
        "Harper", "Elijah", "Lily", "Grace", "Madison", "Caleb", "Emily", "Camila",
        "Benjamin", "Daniel", "Jack", "Addison", "Alexander", "Elizabeth",
        "Mila", "Victoria", "Charlotte", "Luna", "James", "Nathan", "Zoey",
        "Samuel", "Henry", "Scarlett", "Isaiah", "Isla", "Leo", "Evelyn",
        "Gabriel", "Owen", "Luke", "Stella", "Levi", "Hannah", "Zoe",
        "Carter", "Oscar", "Michael", "Julia", "Eli", "Sebastian", "Wyatt",
        "Ellie", "Josiah", "Isaac", "Layla", "Penelope", "Jayden", "Lillian",
        "Lincoln", "Mason", "Sophie", "Kylie", "Natalie", "Violet",
        "Ezra", "Mila", "Thomas", "Andrew", "Katherine", "David",
        "Dominic", "Jaxon", "Eleanor", "Josie", "Alice", "Jasper", "Max",
        "Ivy", "Nora", "Sadie", "Hazel", "Ruby", "Arthur", "Nicholas",
        "Julian", "Grace", "Finn", "Aurora", "Harrison", "Eliza", "Theo",
        "Aaron", "Clara", "Margaret", "Connor", "Robert", "Adeline", "Alexa",
        "Angelina", "Molly", "Hunter", "Xavier", "Ian", "Lydia", "Audrey",
        "Christopher", "John", "Jordan", "Naomi", "Eva", "Faith",
        "Eloise", "Jose", "Charles", "Justin", "Jonathan", "Sarah"];

    static surnames = [
        "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson",
        "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
        "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee",
        "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez",
        "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter",
        "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans",
        "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook",
        "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox",
        "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "James", "Watson",
        "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross",
        "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes",
        "Flores", "Washington", "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander",
        "Russell", "Griffin", "Diaz", "Hayes"
    ];

    static domainNames = [
        "example.com", "mywebsite.org", "coolweb.net", "businessinfo.co", "trending.site",
        "apphouse.io", "yourblog.me", "webstore.shop", "familysite.family", "traveladventure.co.uk"
    ];

    static randomWordsArray = [
        "apple", "banana", "cherry", "dragonfruit", "elderberry", "fig", "grape", "honeydew", "kiwi", "lemon",
        "mango", "nectarine", "orange", "papaya", "quince", "raspberry", "strawberry", "tangerine", "ugli", "vanilla",
        "watermelon", "xigua", "yellowfruit", "zucchini", "blueberry"
    ];

    static repairProducts = [
        "Sewer Fitting", "Electrical Breaker", "Tap", "Water Pipe", "LED Light Bulb", "Shower Head", "Gate Hinge",
        "Concrete Mix", "PVC Elbow", "Brass Hose Fitting", "Toilet Flange", "Pressure Regulator",
        "Asphalt Crack Filler", "Drain Grate", "Circuit Box", "Safety Sign", "Smoke Detector", "Insecticide Spray",
        "Gas Valve", "Wire Nuts", "Decking Screws", "Gravel Bags", "Pipe Insulation", "Cable Ties", "Water Filter",
        "Garden Hose", "Power Outlet", "Weatherproof Sealant", "Fire Extinguisher", "Grounding Rod"];


    static getRandomName(): string {
        return this.firstnames[Math.floor(Math.random() * this.firstnames.length)] + " "
            + this.surnames[Math.floor(Math.random() * this.surnames.length)];
    }

    static getRandomWords(count: number = 1): string {
        return Array.from({length: count}, () =>
            this.randomWordsArray[Math.floor(Math.random() * this.randomWordsArray.length)]).join(' ');
    }

    static generateRandomEmail(): string {
        return `${this.getRandomName().replace(" ", ".")}@${this.domainNames[Math.floor(Math.random() * this.domainNames.length)]}`;
    }

    static getInitials(twoWordString: string): string {
        const words = twoWordString.split(' ');
        if (words.length !== 2) {
            return 'Input string should contain exactly 2 words';
        }
        return words.map(word => word[0]).join('');
    }

    static generateRandomUser(): UserDoc {
        return {
            _id: "", entityType: "",
            name: this.getRandomName(),
            email: this.generateRandomEmail(),
            hashedPassword: this.getRandomWords(),
            salt: this.getRandomWords(),
            inactive: false
        };
    }

    static generateRandomRole(businessGroupId: string): RoleDoc {
        return {
            _id: "", entityType: "",
            roleType: ["User", "Authoriser", "Finance", "Admin"][Math.floor(Math.random() * 4)],
            businessGroupId: businessGroupId
        };
    }

    static generateRandomBusinessGroup(): BusinessGroupDoc {
        const name = this.getRandomWords(2);
        return {
            _id: "", entityType: "",
            name: name,
            shortcode: this.getInitials(name)
        };
    }


// Generate random PurchaseOrderDoc
    static generateRandomLineItem(proposedSupplierId: string, actualSupplierId?: string): LineItemDoc {
        return {
            _id: "", entityType: "",
            name: this.repairProducts[Math.floor(Math.random() * this.repairProducts.length)],
            quantity: Math.floor(Math.random() * 100),
            estimatedPrice: Math.random() * 200,
            actualPrice: Math.random() * 200,
            proposedSupplierId: proposedSupplierId,
            actualSupplierId: actualSupplierId,
            notes: this.getRandomWords(3),
            status: ["Requested", "Ordered", "Good to Collect", "Being Sourced", "Cannot be Found"][Math.floor(Math.random() * 5)]
        };
    }

// Generate random LineItemDoc
    static generateRandomPurchaseOrder(requestorId: string, approvalGroupId: string, businessGroupId: string): PurchaseOrderDoc {
        return {
            _id: "", entityType: "",
            requestorId: requestorId,
            lineItemIds: Array.from({length: 3}, () => this.getRandomWords(1)),
            status: ['Pending', 'Approved', 'Declined', 'Complete'][Math.floor(Math.random() * 4)],
            approvalGroupId: approvalGroupId,
            approvedByUserId: Math.random() > 0.5 ? requestorId : undefined,
            purchaseOrderRef: this.getRandomWords(1),
            taskDescription: this.getRandomWords(12),
            businessGroupId: businessGroupId,
            workLocation: ['Site A', 'Site B', 'Site C'][Math.floor(Math.random() * 3)],
            isBlocking: Math.random() > 0.5,
            requiredBy: Math.random() > 0.5 ? new Date() : undefined
        };
    }
}

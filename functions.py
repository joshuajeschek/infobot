import json
from discord import Embed


def openEmbed(file):    # opens .json file as embed
    f = open(file, 'r')
    d = json.loads(f.read())
    f.close()
    return(Embed.from_dict(d))


if __name__ == '__main__':
    print('r u sure u wanted to execute this file?')
